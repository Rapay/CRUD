const nodemailer = require('nodemailer');
require('dotenv').config();

class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async enviarEmailAgendamento(aula, aluno, tutor) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: aluno.email,
                subject: 'Confirmação de Agendamento de Aula',
                html: `
                    <h2>Aula Agendada com Sucesso!</h2>
                    <p>Olá ${aluno.nome},</p>
                    <p>Sua aula foi agendada com sucesso:</p>
                    <ul>
                        <li>Data: ${new Date(aula.data).toLocaleString()}</li>
                        <li>Tipo: ${aula.tipo}</li>
                        <li>Tutor: ${tutor.nome}</li>
                    </ul>
                    <p>Aguardamos você!</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            return false;
        }
    }

    async enviarNotificacaoConflito(aluno, sugestoes) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: aluno.email,
                subject: 'Conflito de Horário - Sugestões Disponíveis',
                html: `
                    <h2>Horário Indisponível</h2>
                    <p>Olá ${aluno.nome},</p>
                    <p>Infelizmente o horário solicitado está indisponível.</p>
                    <p>Sugerimos os seguintes horários alternativos:</p>
                    <ul>
                        ${sugestoes.map(s => `<li>${new Date(s).toLocaleString()}</li>`).join('')}
                    </ul>
                    <p>Por favor, tente agendar em um desses horários.</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Erro ao enviar notificação de conflito:', error);
            return false;
        }
    }
}

module.exports = new NotificationService();
