const { google } = require('googleapis');
require('dotenv').config();

class GoogleCalendarService {
    constructor() {
        this.auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:5000/auth/google/callback'
        );

        this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    }

    async adicionarEvento(aula, aluno, tutor) {
        try {
            const event = {
                summary: `Aula ${aula.tipo} - ${aluno.nome}`,
                description: `Aula ${aula.tipo} com o tutor ${tutor.nome}`,
                start: {
                    dateTime: new Date(aula.data).toISOString(),
                    timeZone: 'America/Sao_Paulo',
                },
                end: {
                    dateTime: new Date(new Date(aula.data).getTime() + 60*60*1000).toISOString(), // 1 hora após
                    timeZone: 'America/Sao_Paulo',
                },
                attendees: [
                    { email: aluno.email },
                    { email: tutor.email }
                ],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // Lembrete por email 24h antes
                        { method: 'popup', minutes: 30 } // Notificação popup 30min antes
                    ],
                },
            };

            await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            return true;
        } catch (error) {
            console.error('Erro ao adicionar evento ao Google Calendar:', error);
            return false;
        }
    }

    async verificarDisponibilidade(data, tutorEmail) {
        try {
            const response = await this.calendar.freebusy.query({
                resource: {
                    timeMin: new Date(data).toISOString(),
                    timeMax: new Date(new Date(data).getTime() + 60*60*1000).toISOString(), // Próxima hora
                    items: [{ id: 'primary' }, { email: tutorEmail }],
                },
            });

            const eventos = response.data.calendars;
            return !Object.values(eventos).some(calendar => 
                calendar.busy && calendar.busy.length > 0
            );
        } catch (error) {
            console.error('Erro ao verificar disponibilidade:', error);
            return false;
        }
    }
}

module.exports = new GoogleCalendarService();
