const Tutor = require('../models/Tutor');
const Aluno = require('../models/Aluno');
const Aula = require('../models/Aula');

class TutorController {
    async validarAula(req, res) {
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
                return res.status(404).json({ message: 'Aula não encontrada' });
            }

            if (!['CONCLUIDA', 'CANCELADA'].includes(status)) {
                return res.status(400).json({ message: 'Status inválido para validação' });
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
                message: 'Aula validada com sucesso',
                aula,
                alunoAprovado: aula.Aluno.statusAprovacao 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async emitirCertificado(req, res) {
        try {
            const { alunoId } = req.params;
            const aluno = await Aluno.findByPk(alunoId);
            
            if (!aluno) {
                return res.status(404).json({ message: 'Aluno não encontrado' });
            }

            if (!aluno.statusAprovacao) {
                return res.status(400).json({ message: 'Aluno ainda não está aprovado para receber o certificado' });
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
                message: 'Certificado emitido com sucesso',
                certificado
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // CRUD operations
    async create(req, res) {
        try {
            const tutor = await Tutor.create(req.body);
            res.status(201).json(tutor);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const tutores = await Tutor.findAll({
                include: [{
                    model: Aula,
                    attributes: ['data', 'tipo', 'status']
                }]
            });
            res.status(200).json(tutores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findOne(req, res) {
        try {
            const tutor = await Tutor.findByPk(req.params.id, {
                include: [{
                    model: Aula,
                    attributes: ['data', 'tipo', 'status']
                }]
            });
            if (!tutor) {
                return res.status(404).json({ message: 'Tutor não encontrado' });
            }
            res.status(200).json(tutor);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const tutor = await Tutor.findByPk(req.params.id);
            if (!tutor) {
                return res.status(404).json({ message: 'Tutor não encontrado' });
            }
            await tutor.update(req.body);
            res.status(200).json(tutor);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const tutor = await Tutor.findByPk(req.params.id);
            if (!tutor) {
                return res.status(404).json({ message: 'Tutor não encontrado' });
            }
            await tutor.destroy();
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getDisponibilidade(req, res) {
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

module.exports = new TutorController();