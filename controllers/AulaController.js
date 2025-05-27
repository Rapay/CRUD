const Aula = require('../models/Aula');
const Aluno = require('../models/Aluno');
const Tutor = require('../models/Tutor');
const NotificationService = require('../services/NotificationService');

class AulaController {
    // Consulta de horários disponíveis
    static async getHorariosDisponiveis(req, res) {
        try {
            const { tutorId, data } = req.query;
            const dataBase = new Date(data);
            const sugestoes = [];

            // Busca próximos 5 dias úteis
            for (let i = 0; i < 5; i++) {
                dataBase.setDate(dataBase.getDate() + (i === 0 ? 0 : 1));
                
                // Pula finais de semana
                if (dataBase.getDay() === 0 || dataBase.getDay() === 6) {
                    i--;
                    continue;
                }

                const aulaExistente = await Aula.findOne({
                    where: {
                        data: dataBase,
                        TutorId: tutorId,
                        status: 'AGENDADA'
                    }
                });

                if (!aulaExistente) {
                    sugestoes.push(new Date(dataBase));
                }
            }

            res.json(sugestoes);
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao buscar horários disponíveis' });
        }
    }

    // Criar nova aula
    static async criar(req, res) {
        try {
            const { data, tipo, alunoId, tutorId } = req.body;

            // Verifica disponibilidade do horário
            const aulaExistente = await Aula.findOne({
                where: {
                    data: data,
                    TutorId: tutorId,
                    status: 'AGENDADA'
                }
            });

            if (aulaExistente) {
                return res.status(400).json({
                    mensagem: 'Horário indisponível'
                });
            }

            // Cria a aula
            const aula = await Aula.create({
                data,
                tipo,
                AlunoId: alunoId,
                TutorId: tutorId,
                status: 'AGENDADA'
            });

            // Envia notificação
            const aluno = await Aluno.findByPk(alunoId);
            const tutor = await Tutor.findByPk(tutorId);
            await NotificationService.enviarEmailAgendamento(aula, aluno, tutor);

            res.status(201).json(aula);
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao criar aula' });
        }
    }

    // Listar todas as aulas
    static async listar(req, res) {
        try {
            const aulas = await Aula.findAll({
                include: [
                    { model: Aluno },
                    { model: Tutor }
                ]
            });
            res.json(aulas);
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao listar aulas' });
        }
    }

    // Buscar aula por ID
    static async buscarPorId(req, res) {
        try {
            const aula = await Aula.findByPk(req.params.id, {
                include: [
                    { model: Aluno },
                    { model: Tutor }
                ]
            });
            
            if (!aula) {
                return res.status(404).json({ mensagem: 'Aula não encontrada' });
            }

            res.json(aula);
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao buscar aula' });
        }
    }

    // Atualizar aula
    static async atualizar(req, res) {
        try {
            const { data, tipo, status } = req.body;
            const aula = await Aula.findByPk(req.params.id);

            if (!aula) {
                return res.status(404).json({ mensagem: 'Aula não encontrada' });
            }

            // Se estiver mudando a data, verifica disponibilidade
            if (data && data !== aula.data) {
                const aulaExistente = await Aula.findOne({
                    where: {
                        data: data,
                        TutorId: aula.TutorId,
                        status: 'AGENDADA',
                        id: { [Op.ne]: aula.id }
                    }
                });

                if (aulaExistente) {
                    return res.status(400).json({ mensagem: 'Horário indisponível' });
                }
            }

            await aula.update({ data, tipo, status });
            res.json(aula);
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao atualizar aula' });
        }
    }

    // Cancelar aula
    static async cancelar(req, res) {
        try {
            const aula = await Aula.findByPk(req.params.id);

            if (!aula) {
                return res.status(404).json({ mensagem: 'Aula não encontrada' });
            }

            if (aula.status === 'CONCLUIDA') {
                return res.status(400).json({ mensagem: 'Não é possível cancelar uma aula já concluída' });
            }

            await aula.update({ status: 'CANCELADA' });
            res.json({ mensagem: 'Aula cancelada com sucesso' });
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao cancelar aula' });
        }
    }
}

module.exports = AulaController;