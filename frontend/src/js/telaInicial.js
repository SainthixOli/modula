document.addEventListener('DOMContentLoaded', () => {

    // --- DADOS "FAKE" (MOCK DATA) PARA SIMULAR O BACKEND ---
    const mockAgendamentos = {
        // Chave: "ANO-MÊS-DIA" (Mês começa em 1)
        '2025-9-17': [
            { hora: '09:00', paciente: 'Carlos Pereira', tipo: 'Consulta', status: 'green', isNew: true },
            { hora: '11:30', paciente: 'Mariana Costa', tipo: 'Retorno', status: 'blue', isNew: false }
        ],
        '2025-9-18': [
            { hora: '10:30', paciente: 'João da Silva', tipo: 'Consulta', status: 'green', isNew: false }
        ],
        '2025-9-19': [
            { hora: '14:00', paciente: 'Maria Oliveira', tipo: 'Retorno', status: 'blue', isNew: false }
        ],
        '2025-9-21': [
            { hora: '09:00', paciente: 'Equipe', tipo: 'Reunião', status: 'orange', isNew: false }
        ]
    };

    // --- ELEMENTOS DO HTML ---
    const monthYearElement = document.getElementById('calendar-month-year');
    const datesElement = document.getElementById('calendar-dates');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const upcomingListElement = document.getElementById('upcoming-list');
    const statsVisits = document.getElementById('stats-visits');
    const statsNewPatients = document.getElementById('stats-new-patients');
    const statsOldPatients = document.getElementById('stats-old-patients');

    let currentDate = new Date();

    // --- FUNÇÕES DO DASHBOARD ---

    function renderCalendar() {
        if (!monthYearElement || !datesElement) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        monthYearElement.textContent = `${monthNames[month]} ${year}`;
        datesElement.innerHTML = `<div class="day-name">DOM</div><div class="day-name">SEG</div><div class="day-name">TER</div><div class="day-name">QUA</div><div class="day-name">QUI</div><div class="day-name">SEX</div><div class="day-name">SAB</div>`;
        
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();

        for (let i = 0; i < firstDayOfWeek; i++) {
            datesElement.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const dayCell = document.createElement('div');
            dayCell.textContent = day;
            dayCell.classList.add('date-num');
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('active');
            }
            datesElement.appendChild(dayCell);
        }
    }

    function renderUpcomingAppointments() {
        if (!upcomingListElement) return;

        const proximosSeteDias = [];
        const hoje = new Date();

        for (let i = 0; i < 7; i++) {
            const dataFutura = new Date(hoje);
            dataFutura.setDate(hoje.getDate() + i);
            const chave = `${dataFutura.getFullYear()}-${dataFutura.getMonth() + 1}-${dataFutura.getDate()}`;

            if (mockAgendamentos[chave]) {
                mockAgendamentos[chave].forEach(agendamento => {
                    proximosSeteDias.push({ data: dataFutura, ...agendamento });
                });
            }
        }
        
        upcomingListElement.innerHTML = '';

        if (proximosSeteDias.length === 0) {
            upcomingListElement.innerHTML = `<li class="empty-state"><p>Nenhum compromisso para os próximos 7 dias.</p></li>`;
            return;
        }

        proximosSeteDias.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'upcoming-item';
            const dataFormatada = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(item.data);
            listItem.innerHTML = `
                <div class="item-icon ${item.status}">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="item-info">
                    <h4>${item.tipo} - ${item.paciente}</h4>
                    <p>${dataFormatada} - ${item.hora}</p>
                </div>
            `;
            upcomingListElement.appendChild(listItem);
        });
    }

    function renderStats() {
        if (!statsVisits) return;

        const hoje = new Date();
        const chaveHoje = `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`;
        const agendamentosDeHoje = mockAgendamentos[chaveHoje] || [];

        let visitasHoje = agendamentosDeHoje.length;
        let novosPacientes = agendamentosDeHoje.filter(ag => ag.isNew).length;
        let antigosPacientes = visitasHoje - novosPacientes;

        statsVisits.textContent = visitasHoje.toString().padStart(2, '0');
        statsNewPatients.textContent = novosPacientes.toString().padStart(2, '0');
        statsOldPatients.textContent = antigosPacientes.toString().padStart(2, '0');
    }

    // --- LÓGICA DOS CLIQUES ---
    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if(datesElement){
        datesElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('date-num')) {
                const selected = datesElement.querySelector('.selected');
                if (selected) selected.classList.remove('selected');
                event.target.classList.add('selected');
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    renderCalendar();
    renderUpcomingAppointments();
    renderStats();
});