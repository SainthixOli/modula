document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DO CALENDÁRIO DINÂMICO ---

    // 1. Encontra os elementos do calendário no HTML
    const monthYearElement = document.getElementById('calendar-month-year');
    const datesElement = document.getElementById('calendar-dates');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    // 2. Guarda a data que o calendário está a mostrar (começa com o mês atual)
    let currentDate = new Date();

    // 3. Função principal que desenha o calendário na tela
    function renderCalendar() {
        // Pega o ano e o mês da data atual
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Define o texto do cabeçalho (ex: "Setembro 2025")
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        monthYearElement.textContent = `${monthNames[month]} ${year}`;

        // Limpa a grelha de datas antes de desenhar o novo mês
        // (Mantém apenas os nomes dos dias da semana)
        datesElement.innerHTML = `
            <div class="day-name">DOM</div><div class="day-name">SEG</div><div class="day-name">TER</div>
            <div class="day-name">QUA</div><div class="day-name">QUI</div><div class="day-name">SEX</div>
            <div class="day-name">SAB</div>
        `;

        // Cálculos para saber onde os dias caem
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Segunda...

        // Adiciona divs vazias para os dias antes do dia 1
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            datesElement.appendChild(emptyCell);
        }

        // Cria e adiciona um div para cada dia do mês
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const dayCell = document.createElement('div');
            dayCell.textContent = day;
            dayCell.classList.add('date-num');

            // Marca o dia de hoje com um destaque especial
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('active');
            }
            
            datesElement.appendChild(dayCell);
        }
    }

    // 4. Lógica dos Cliques nos botões e dias

    // Ouve o clique no botão de "mês anterior"
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    // Ouve o clique no botão de "próximo mês"
    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Ouve cliques nos dias do calendário para o efeito de seleção
    datesElement.addEventListener('click', (event) => {
        // Verifica se o que foi clicado é um número de dia
        if (event.target.classList.contains('date-num')) {
            // Remove a seleção de qualquer outro dia que estivesse selecionado antes
            const selected = datesElement.querySelector('.selected');
            if (selected) {
                selected.classList.remove('selected');
            }
            // Adiciona a classe 'selected' (que tem o fundo azul no CSS) ao dia que foi clicado
            event.target.classList.add('selected');
        }
    });

    // 5. Inicia o calendário pela primeira vez
    renderCalendar();

});

document.addEventListener('DOMContentLoaded', () => {

    // --- DADOS "FAKE" (MOCK DATA) PARA SIMULAR O BACKEND ---
    const mockAgendamentos = {
        // Chave: "ANO-MÊS-DIA" (Mês começa em 1)
        // Usando a data de hoje (15 de Setembro de 2025) para o exemplo
        '2025-9-15': [
            { hora: '09:00', paciente: 'Carlos Pereira', tipo: 'Consulta', status: 'green', isNew: true },
            { hora: '11:30', paciente: 'Mariana Costa', tipo: 'Retorno', status: 'blue', isNew: false }
        ],
        '2025-9-16': [
            { hora: '10:30', paciente: 'João da Silva', tipo: 'Consulta', status: 'green', isNew: false }
        ],
        '2025-9-17': [
            { hora: '14:00', paciente: 'Maria Oliveira', tipo: 'Retorno', status: 'blue', isNew: false }
        ],
        '2025-9-19': [
            { hora: '09:00', paciente: 'Equipa', tipo: 'Reunião', status: 'orange', isNew: false }
        ]
    };


    // --- LÓGICA DO MINI-CALENDÁRIO DO DASHBOARD ---
    // (Todo o código do renderCalendar e seus listeners continua aqui, sem alterações)
    const monthYearElement = document.getElementById('calendar-month-year');
    const datesElement = document.getElementById('calendar-dates');
    // ... (resto do código do calendário que já fizemos)


    // --- LÓGICA DO CARD "CHEGANDO" ---
    const upcomingListElement = document.getElementById('upcoming-list');

    function renderUpcomingAppointments() {
        // ... (código do renderUpcomingAppointments que já fizemos continua aqui)
    }


    // --- NOVO: LÓGICA DO CARD DE ESTATÍSTICAS ---
    const statsVisits = document.getElementById('stats-visits');
    const statsNewPatients = document.getElementById('stats-new-patients');
    const statsOldPatients = document.getElementById('stats-old-patients');

    function renderStats() {
        // Pega a data de hoje para procurar nos dados fake
        const hoje = new Date();
        const chaveHoje = `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`;
        
        const agendamentosDeHoje = mockAgendamentos[chaveHoje] || []; // Se não achar nada, retorna uma lista vazia

        let visitasHoje = agendamentosDeHoje.length;
        let novosPacientes = 0;
        let antigosPacientes = 0;

        agendamentosDeHoje.forEach(agendamento => {
            if (agendamento.isNew) {
                novosPacientes++;
            } else {
                antigosPacientes++;
            }
        });

        // Atualiza o HTML com os valores calculados
        if(statsVisits) statsVisits.textContent = visitasHoje.toString().padStart(2, '0');
        if(statsNewPatients) statsNewPatients.textContent = novosPacientes.toString().padStart(2, '0');
        if(statsOldPatients) statsOldPatients.textContent = antigosPacientes.toString().padStart(2, '0');
    }
    
    // --- FUNÇÕES COMPLETAS E INICIALIZAÇÃO ---
    // (Para garantir que tudo esteja correto, copie e cole este bloco inteiro substituindo o seu)
    
    function renderCalendar() { const year = currentDate.getFullYear(); const month = currentDate.getMonth(); const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]; if(monthYearElement) monthYearElement.textContent = `${monthNames[month]} ${year}`; if(!datesElement) return; datesElement.innerHTML = `<div class="day-name">DOM</div><div class="day-name">SEG</div><div class="day-name">TER</div><div class="day-name">QUA</div><div class="day-name">QUI</div><div class="day-name">SEX</div><div class="day-name">SAB</div>`; const firstDayOfMonth = new Date(year, month, 1); const lastDayOfMonth = new Date(year, month + 1, 0); const firstDayOfWeek = firstDayOfMonth.getDay(); for (let i = 0; i < firstDayOfWeek; i++) { datesElement.appendChild(document.createElement('div')); } for (let day = 1; day <= lastDayOfMonth.getDate(); day++) { const dayCell = document.createElement('div'); dayCell.textContent = day; dayCell.classList.add('date-num'); const today = new Date(); if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) { dayCell.classList.add('active'); } datesElement.appendChild(dayCell); } }
    if (prevMonthButton) { prevMonthButton.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); }); }
    if (nextMonthButton) { nextMonthButton.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); }); }
    if(datesElement){ datesElement.addEventListener('click', (event) => { if (event.target.classList.contains('date-num')) { const selected = datesElement.querySelector('.selected'); if (selected) selected.classList.remove('selected'); event.target.classList.add('selected'); } }); renderCalendar(); }
    
    // Inicia as funções ao carregar a página
    renderUpcomingAppointments();
    renderStats(); // NOVO: Chama a função das estatísticas

});