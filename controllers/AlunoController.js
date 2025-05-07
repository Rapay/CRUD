const Aluno = require('../models/Aluno');
const Aula = require('../models/Aula');

class AlunoController {
    async agendarAula(req, res) {
        try {
            const { alunoId } = req.params;
            const { data, tipo, tutorId } = req.body;
            
            const aluno = await Aluno.findByPk(alunoId);
            if (!aluno) {
                return res.status(404).json({ message: 'Aluno não encontrado' });
            }

            // Verifica se já existe aula agendada no mesmo horário
            const aulaExistente = await Aula.findOne({
                where: {
                    data,
                    status: 'AGENDADA'
                }
            });

            if (aulaExistente) {
                return res.status(400).json({ message: 'Já existe uma aula agendada neste horário' });
            }

            // Cria a aula
            const aula = await Aula.create({
                data,
                tipo,
                AlunoId: alunoId,
                TutorId: tutorId,
                status: 'AGENDADA'
            });

            res.status(201).json({
                message: 'Aula agendada com sucesso',
                aula
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async solicitarCertificado(req, res) {
        try {
            const { alunoId } = req.params;
            const aluno = await Aluno.findByPk(alunoId);
            
            if (!aluno) {
                return res.status(404).json({ message: 'Aluno não encontrado' });
            }

            if (!aluno.statusAprovacao) {
                return res.status(400).json({ message: 'Aluno ainda não está aprovado para receber o certificado' });
            }

            // Lógica para gerar certificado será implementada posteriormente
            res.status(200).json({ message: 'Solicitação de certificado realizada com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    
    async create(req, res) {
        try {
            const aluno = await Aluno.create(req.body);
            res.status(201).json(aluno);
        } catch (error) {
            res.status(400).json({ error: error.message });
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
                return res.status(404).json({ message: 'Aluno não encontrado' });
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
                return res.status(404).json({ message: 'Aluno não encontrado' });
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
                return res.status(404).json({ message: 'Aluno não encontrado' });
            }
            await aluno.destroy();
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AlunoController();