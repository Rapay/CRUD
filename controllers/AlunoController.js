const Aluno = require('../models/Aluno');
const Aula = require('../models/Aula');
const Tutor = require('../models/Tutor');
const NotificationService = require('../services/NotificationService');
const GoogleCalendarService = require('../config/googleCalendar');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AlunoController {
    async agendarAula(req, res) {
        try {
            const { alunoId } = req.params;
            const { data, tipo, tutorId } = req.body;
            
            // Validação do aluno
            const aluno = await Aluno.findByPk(alunoId);
            if (!aluno) {
                return res.status(404).json({ mensagem: 'Aluno não encontrado' });
            }

            // Validação de aprovação teórica
            if (tipo === 'PRATICA' && !aluno.statusAprovacao) {
                return res.status(400).json({ 
                    mensagem: 'Aluno precisa ter aprovação teórica para agendar aulas práticas'
                });
            }

            const tutor = await Tutor.findByPk(tutorId);
            if (!tutor) {
                return res.status(404).json({ mensagem: 'Tutor não encontrado' });
            }

            // Verificação de disponibilidade em múltiplas fontes
            const [tutorDisponivel, calendarioDisponivel] = await Promise.all([
                this.verificarDisponibilidadeTutor(tutorId, data),
                GoogleCalendarService.verificarDisponibilidade(data, tutor.email)
            ]);

            if (!tutorDisponivel || !calendarioDisponivel) {
                // Gerar sugestões de horários alternativos
                const sugestoes = await this.gerarSugestoesHorario(tutorId, data);
                await NotificationService.enviarNotificacaoConflito(aluno, sugestoes);
                
                return res.status(400).json({ 
                    mensagem: 'Horário indisponível',
                    sugestoes
                });
            }

            // Bloqueio temporário do horário
            await this.bloquearHorario(tutorId, data);

            // Criação da aula
            const aula = await Aula.create({
                data,
                tipo,
                AlunoId: alunoId,
                TutorId: tutorId,
                status: 'AGENDADA'
            });

            // Integrações externas
            await Promise.all([
                GoogleCalendarService.adicionarEvento(aula, aluno, tutor),
                NotificationService.enviarEmailAgendamento(aula, aluno, tutor)
            ]);

            return res.status(201).json({
                mensagem: 'Aula agendada com sucesso',
                aula
            });
        } catch (error) {
            console.error('Erro ao agendar aula:', error);
            res.status(500).json({ erro: error.message });
        }
    }

    async gerarSugestoesHorario(tutorId, dataOriginal) {
        const data = new Date(dataOriginal);
        const sugestoes = [];
        
        // Gera 3 sugestões de horários alternativos
        for (let i = 1; i <= 3; i++) {
            data.setHours(data.getHours() + 1);
            const disponivel = await this.verificarDisponibilidadeTutor(tutorId, data);
            if (disponivel) {
                sugestoes.push(new Date(data));
            }
        }
        
        return sugestoes;
    }

    async solicitarCertificado(req, res) {
        try {
            const { alunoId } = req.params;
            const aluno = await Aluno.findByPk(alunoId);
            
            if (!aluno) {
                return res.status(404).json({ mensagem: 'Aluno não encontrado' });
            }

            if (!aluno.statusAprovacao) {
                return res.status(400).json({ mensagem: 'Aluno ainda não está aprovado para receber o certificado' });
            }

            res.status(200).json({ mensagem: 'Solicitação de certificado realizada com sucesso' });
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async listarAulas(req, res) {
        try {
            const aulas = await Aula.findAll({
                where: { AlunoId: req.aluno.id },
                include: [{ model: Tutor }]
            });
            res.json(aulas);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async obterSugestoesHorario(req, res) {
        try {
            const { tutorId, data } = req.query;
            const sugestoes = await this.gerarSugestoesHorario(tutorId, new Date(data));
            res.json(sugestoes);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async create(req, res) {
        try {
            const { nome, email, senha } = req.body;

            // Validações básicas
            if (!nome || !email || !senha) {
                return res.status(400).json({ 
                    mensagem: 'Nome, email e senha são obrigatórios' 
                });
            }

            // Verifica se o email já está em uso
            const alunoExistente = await Aluno.findOne({ where: { email } });
            if (alunoExistente) {
                return res.status(400).json({ 
                    mensagem: 'Este email já está em uso' 
                });
            }

            const aluno = await Aluno.create({ nome, email, senha });
            
            // Remove a senha do objeto retornado
            const { senha: _, ...alunoSemSenha } = aluno.toJSON();
            
            res.status(201).json({
                mensagem: 'Aluno cadastrado com sucesso',
                aluno: alunoSemSenha
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ 
                mensagem: 'Erro ao criar aluno',
                erro: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async findAll(req, res) {
        try {
            const alunos = await Aluno.findAll();
            res.status(200).json(alunos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findOne(req, res) {
        try {
            const aluno = await Aluno.findByPk(req.params.id);
            if (!aluno) {
                return res.status(404).json({ mensagem: 'Aluno não encontrado' });
            }
            res.status(200).json(aluno);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const aluno = await Aluno.findByPk(req.params.id);
            if (!aluno) {
                return res.status(404).json({ mensagem: 'Aluno não encontrado' });
            }
            await aluno.update(req.body);
            res.status(200).json(aluno);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const aluno = await Aluno.findByPk(req.params.id);
            if (!aluno) {
                return res.status(404).json({ mensagem: 'Aluno não encontrado' });
            }
            await aluno.destroy();
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Métodos auxiliares
    async verificarDisponibilidadeTutor(tutorId, data) {
        // Implementação da verificação de disponibilidade em tempo real
        const tutor = await Tutor.findByPk(tutorId);
        if (!tutor) return false;

        const aulasMesmoHorario = await Aula.findOne({
            where: {
                TutorId: tutorId,
                data: data,
                status: 'AGENDADA'
            }
        });

        return !aulasMesmoHorario;
    }

    async bloquearHorario(tutorId, data) {
        // Implementação do bloqueio temporário do horário
        // Pode ser implementado com um sistema de cache ou banco de dados
        return true;
    }

    async adicionarAoGoogleCalendar(aula) {
        try {
            // Implementação da integração com Google Calendar
            console.log('Aula adicionada ao Google Calendar');
        } catch (error) {
            console.error('Erro ao adicionar ao Google Calendar:', error);
        }
    }

    async enviarNotificacoes(aula) {
        try {
            // Implementação do sistema de notificações
            console.log('Notificações enviadas');
        } catch (error) {
            console.error('Erro ao enviar notificações:', error);
        }
    }

    // Métodos de autenticação
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            
            const aluno = await Aluno.findOne({ where: { email } });
            if (!aluno) {
                return res.status(401).json({ mensagem: 'Credenciais inválidas' });
            }

            const senhaValida = await bcrypt.compare(senha, aluno.senha);
            if (!senhaValida) {
                return res.status(401).json({ mensagem: 'Credenciais inválidas' });
            }

            const token = jwt.sign(
                { id: aluno.id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                aluno: {
                    id: aluno.id,
                    nome: aluno.nome,
                    email: aluno.email,
                    statusAprovacao: aluno.statusAprovacao
                }
            });
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const aluno = await Aluno.findByPk(req.aluno.id, {
                include: [{
                    model: Aula,
                    include: [{ model: Tutor }]
                }]
            });
            res.json(aluno);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { nome, email, senha } = req.body;
            const aluno = req.aluno;

            if (senha) {
                const salt = await bcrypt.genSalt(10);
                aluno.senha = await bcrypt.hash(senha, salt);
            }

            aluno.nome = nome || aluno.nome;
            aluno.email = email || aluno.email;

            await aluno.save();
            res.json({
                message: 'Perfil atualizado com sucesso',
                aluno: {
                    id: aluno.id,
                    nome: aluno.nome,
                    email: aluno.email,
                    statusAprovacao: aluno.statusAprovacao
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AlunoController();