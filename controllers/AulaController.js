const Aula = require('../models/Aula');
const Aluno = require('../models/Aluno');
const Tutor = require('../models/Tutor');

class AulaController {
    async create(req, res) {
        try {
            const { alunoId, tutorId, data, tipo } = req.body;
            
            // Validate if aluno and tutor exist
            const aluno = await Aluno.findByPk(alunoId);
            const tutor = await Tutor.findByPk(tutorId);
            
            if (!aluno) {
                return res.status(404).json({ message: 'Aluno não encontrado' });
            }
            if (!tutor) {
                return res.status(404).json({ message: 'Tutor não encontrado' });
            }

            const aula = await Aula.create({
                data,
                tipo,
                AlunoId: alunoId,
                TutorId: tutorId
            });

            res.status(201).json(aula);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const aulas = await Aula.findAll({
                include: [
                    { model: Aluno, attributes: ['nome', 'email'] },
                    { model: Tutor, attributes: ['nome', 'especialidade'] }
                ]
            });
            res.status(200).json(aulas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findOne(req, res) {
        try {
            const aula = await Aula.findByPk(req.params.id, {
                include: [
                    { model: Aluno, attributes: ['nome', 'email'] },
                    { model: Tutor, attributes: ['nome', 'especialidade'] }
                ]
            });
            if (!aula) {
                return res.status(404).json({ message: 'Aula não encontrada' });
            }
            res.status(200).json(aula);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const aula = await Aula.findByPk(req.params.id);
            if (!aula) {
                return res.status(404).json({ message: 'Aula não encontrada' });
            }
            await aula.update(req.body);
            res.status(200).json(aula);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const aula = await Aula.findByPk(req.params.id);
            if (!aula) {
                return res.status(404).json({ message: 'Aula não encontrada' });
            }
            await aula.destroy();
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const aula = await Aula.findByPk(id);
            if (!aula) {
                return res.status(404).json({ message: 'Aula não encontrada' });
            }

            if (!['AGENDADA', 'CONCLUIDA', 'CANCELADA'].includes(status)) {
                return res.status(400).json({ message: 'Status inválido' });
            }

            await aula.update({ status });
            res.status(200).json(aula);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getHorariosDisponiveis(req, res) {
        try {
            const { tutorId, data } = req.query;
            const horarios = await this.gerarHorariosDisponiveis(tutorId, new Date(data));
            res.status(200).json(horarios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async gerarHorariosDisponiveis(tutorId, data) {
        const horarios = [];
        const horaInicio = 8; // 8:00
        const horaFim = 18;   // 18:00

        for (let hora = horaInicio; hora < horaFim; hora++) {
            const horario = new Date(data);
            horario.setHours(hora, 0, 0, 0);

            const aulaExistente = await Aula.findOne({
                where: {
                    TutorId: tutorId,
                    data: horario,
                    status: 'AGENDADA'
                }
            });

            if (!aulaExistente) {
                horarios.push(horario);
            }
        }

        return horarios;
    }
}

module.exports = new AulaController();