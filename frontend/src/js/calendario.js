document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO HTML ---
    const currentYearElement = document.getElementById('current-year');
    const yearGridContainer = document.getElementById('year-grid-container');
    const prevYearButton = document.getElementById('prev-year-btn');
    const nextYearButton = document.getElementById('next-year-btn');
    const monthDetailsModal = document.getElementById('month-details-modal');
    const closeModalButton = document.getElementById('close-modal-btn');
    const modalContent = document.getElementById('modal-calendar-content');
    const detailsPanel = document.getElementById('details-panel');
    const detailsPanelDate = document.getElementById('details-panel-date');
    const detailsPanelContent = document.getElementById('details-panel-content');
    const closePanelButton = document.getElementById('close-panel');
    const newAppointmentModal = document.getElementById('new-appointment-modal');
    const newAppointmentButton = document.querySelector('.calendar-header .btn-primary');
    const closeNewAppointmentModalButton = newAppointmentModal.querySelector('.close-modal');

    // --- ESTADO INICIAL ---
    let currentYear = new Date().getFullYear();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // --- DADOS "FAKE" (MOCK DATA) ---
    const mockAgendamentos = {
        '2025-9-15': [
            { hora: '09:00', paciente: 'Carlos Pereira', tipo: 'Consulta', status: 'green', icon: 'fa-user-doctor' },
            { hora: '11:30', paciente: 'Mariana Costa', tipo: 'Retorno', status: 'blue', icon: 'fa-briefcase-medical' }
        ],
        '2025-9-19': [
            { hora: '09:00', paciente: 'Equipa', tipo: 'Reunião', status: 'orange', icon: 'fa-users' }
        ]
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    function renderAnnualView(year) {
        currentYearElement.textContent = year;
        yearGridContainer.innerHTML = '';
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const monthCard = document.createElement('div');
            monthCard.className = 'month-card';
            monthCard.dataset.month = monthIndex;
            monthCard.dataset.year = year;
            const monthHeader = document.createElement('div');
            monthHeader.className = 'month-header';
            monthHeader.textContent = monthNames[monthIndex];
            monthCard.appendChild(monthHeader);
            monthCard.appendChild(createMiniCalendar(year, monthIndex));
            yearGridContainer.appendChild(monthCard);
        }
    }

    function createMiniCalendar(year, month) {
        const miniGrid = document.createElement('div');
        miniGrid.className = 'mini-calendar-grid';
        const dayHeaders = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        dayHeaders.forEach(header => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'mini-day header';
            dayHeader.textContent = header;
            miniGrid.appendChild(dayHeader);
        });
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            miniGrid.appendChild(document.createElement('div'));
        }
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'mini-day';
            dayCell.textContent = day;
            miniGrid.appendChild(dayCell);
        }
        return miniGrid;
    }

    function renderDetailedMonthView(year, month) {
        modalContent.innerHTML = '';
        const header = document.createElement('header');
        header.className = 'calendar-header';
        const monthTitle = document.createElement('h2');
        monthTitle.textContent = `${monthNames[month]} ${year}`;
        header.appendChild(monthTitle);
        modalContent.appendChild(header);
        const detailedGrid = document.createElement('div');
        detailedGrid.className = 'calendar-grid-full';
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        dayNames.forEach(name => {
            const dayName = document.createElement('div');
            dayName.className = 'day-name-full';
            dayName.textContent = name;
            detailedGrid.appendChild(dayName);
        });
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell other-month';
            detailedGrid.appendChild(emptyCell);
        }
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.dataset.day = day;
            const dayNumber = document.createElement('span');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);
            detailedGrid.appendChild(dayCell);
        }
        modalContent.appendChild(detailedGrid);
        setupDetailedGridListener(detailedGrid, year, month);
    }

    function exibirAgendamentos(agendamentos) {
        detailsPanelContent.innerHTML = '';
        if (!agendamentos || agendamentos.length === 0) {
            detailsPanelContent.innerHTML = `<p class="empty-state">Nenhum agendamento para este dia.</p>`;
            return;
        }
        const listBox = document.createElement('div');
        listBox.className = 'appointment-list-box';
        agendamentos.forEach(agendamento => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'appointment-detail-item';
            itemDiv.innerHTML = `
                <div class="item-icon-details ${agendamento.status}">
                    <i class="fas ${agendamento.icon}"></i>
                </div>
                <div class="info">
                    <h4>${agendamento.tipo} - ${agendamento.paciente}</h4>
                    <p>Horário: ${agendamento.hora}</p>
                </div>
            `;
            listBox.appendChild(itemDiv);
        });
        detailsPanelContent.appendChild(listBox);
    }

    function setupDetailedGridListener(grid, year, month) {
        grid.addEventListener('click', (event) => {
            const dayCell = event.target.closest('.day-cell:not(.other-month)');
            if (dayCell) {
                const day = dayCell.dataset.day;
                detailsPanelDate.textContent = `Agendamentos - ${day} de ${monthNames[month]}`;
                detailsPanel.classList.add('active');
                const chaveDaData = `${year}-${month + 1}-${day}`;
                const agendamentosDoDia = mockAgendamentos[chaveDaData];
                exibirAgendamentos(agendamentosDoDia);
            }
        });
    }

    // --- LÓGICA DOS CLIQUES ---
    prevYearButton.addEventListener('click', () => { currentYear--; renderAnnualView(currentYear); });
    nextYearButton.addEventListener('click', () => { currentYear++; renderAnnualView(currentYear); });
    yearGridContainer.addEventListener('click', (event) => {
        const monthCard = event.target.closest('.month-card');
        if (monthCard) {
            const month = parseInt(monthCard.dataset.month);
            const year = parseInt(monthCard.dataset.year);
            renderDetailedMonthView(year, month);
            monthDetailsModal.classList.add('active');
        }
    });
    closeModalButton.addEventListener('click', () => { monthDetailsModal.classList.remove('active'); });
    if (closePanelButton) {
        closePanelButton.addEventListener('click', () => { detailsPanel.classList.remove('active'); });
    }
    if (newAppointmentButton) {
        newAppointmentButton.addEventListener('click', () => { newAppointmentModal.classList.add('active'); });
    }
    if (closeNewAppointmentModalButton) {
        closeNewAppointmentModalButton.addEventListener('click', () => { newAppointmentModal.classList.remove('active'); });
    }

    // --- INICIALIZAÇÃO ---
    renderAnnualView(currentYear);
});