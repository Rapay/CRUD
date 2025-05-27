const Tutor = require('../models/Tutor');
const Aluno = require('../models/Aluno');
const Aula = require('../models/Aula');

class TutorController {
    // Métodos CRUD
    static async criar(req, res) {
        try {
            const { nome, especialidade } = req.body;
            const tutor = await Tutor.create({
                nome,
                especialidade
            });
            res.status(201).json(tutor);
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao criar tutor' });
        }
    }

    static async listar(req, res) {
        try {
            const tutores = await Tutor.findAll();
            res.json(tutores);
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao listar tutores' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const tutor = await Tutor.findByPk(req.params.id);
            
            if (!tutor) {
                return res.status(404).json({ mensagem: 'Tutor não encontrado' });
            }

            res.json(tutor);
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao buscar tutor' });
        }
    }

    static async atualizar(req, res) {
        try {
            const { nome, especialidade } = req.body;
            const tutor = await Tutor.findByPk(req.params.id);

            if (!tutor) {
                return res.status(404).json({ mensagem: 'Tutor não encontrado' });
            }

            await tutor.update({ nome, especialidade });
            res.json(tutor);
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao atualizar tutor' });
        }
    }

    static async excluir(req, res) {
        try {
            const tutor = await Tutor.findByPk(req.params.id);

            if (!tutor) {
                return res.status(404).json({ mensagem: 'Tutor não encontrado' });
            }

            // Verifica se o tutor possui aulas agendadas
            const aulasAgendadas = await Aula.count({
                where: { TutorId: req.params.id }
            });

            if (aulasAgendadas > 0) {
                return res.status(400).json({ 
                    mensagem: 'Não é possível excluir tutor com aulas agendadas' 
                });
            }

            await tutor.destroy();
            res.json({ mensagem: 'Tutor excluído com sucesso' });
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao excluir tutor' });
        }
    }

    // Métodos de negócio
    static async validarAula(req, res) {
        try {
            const { aulaId } = req.params;
            const { status } = req.body;
            
            const aula = await Aula.findByPk(aulaId, {
                include: [
                    { model: Aluno },
                    { model: Tutor }
                ]
            });
            
            if (!aula) {
                return res.status(404).json({ mensagem: 'Aula não encontrada' });
            }

            if (!['CONCLUIDA', 'CANCELADA'].includes(status)) {
                return res.status(400).json({ mensagem: 'Status inválido para validação' });
            }

            // Atualiza o status da aula
            await aula.update({ status });

            // Se a aula foi concluída, verifica se o aluno já pode ser aprovado
            if (status === 'CONCLUIDA') {
                const aulasAluno = await Aula.findAll({
                    where: {
                        AlunoId: aula.Aluno.id,
                        status: 'CONCLUIDA'
                    }
                });

                // Se o aluno tiver pelo menos 20 aulas concluídas (exemplo de regra), ele é aprovado
                if (aulasAluno.length >= 20) {
                    await aula.Aluno.update({ statusAprovacao: true });
                }
            }

            res.status(200).json({ 
                mensagem: 'Aula validada com sucesso',
                aula,
                alunoAprovado: aula.Aluno.statusAprovacao 
            });
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    static async emitirCertificado(req, res) {
        try {
            const { alunoId } = req.params;
            const aluno = await Aluno.findByPk(alunoId);
            
            if (!aluno) {
                return res.status(404).json({ mensagem: 'Aluno não encontrado' });
            }

            if (!aluno.statusAprovacao) {
                return res.status(400).json({ mensagem: 'Aluno ainda não está aprovado para receber o certificado' });
            }

            // Contagem de aulas concluídas
            const aulasConcluidas = await Aula.findAll({
                where: {
                    AlunoId: alunoId,
                    status: 'CONCLUIDA'
                }
            });

            const certificado = {
                alunoNome: aluno.nome,
                dataEmissao: new Date(),
                numeroAulas: aulasConcluidas.length,
                id: `CERT-${aluno.id}-${Date.now()}`
            };

            res.status(200).json({ 
                mensagem: 'Certificado emitido com sucesso',
                certificado
            });
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    static async getDisponibilidade(req, res) {
        try {
            const { id } = req.params;
            const { data } = req.query;
            
            const aulas = await Aula.findAll({
                where: {
                    TutorId: id,
                    data: new Date(data),
                    status: 'AGENDADA'
                }
            });

            const horariosOcupados = aulas.map(aula => ({
                inicio: aula.data,
                fim: new Date(new Date(aula.data).getTime() + 60*60*1000) // 1 hora após
            }));

            res.status(200).json({
                tutorId: id,
                data: data,
                horariosOcupados
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TutorController;