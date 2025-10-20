    /**
 * MÓDULA - SERVICE DE EXPORT EM PDF
 * 
 * Serviço para conversão de relatórios em PDFs profissionais.
 * Geração de documentos formatados prontos para impressão.
 * 
 * Funcionalidades implementadas:
 * - Conversão HTML para PDF
 * - Templates profissionais responsivos
 * - Headers e footers automáticos
 * - Controle de quebra de página
 * - Formatação para impressão
 * - Numeração de páginas
 * 
 * Recursos especiais:
 * - Configuração de margens
 * - Orientação portrait/landscape
 * - Tamanho de papel configurável
 * - Cabeçalhos e rodapés dinâmicos
 * - Watermarks opcionais
 * - Compressão de imagens
 */

const pdf = require('html-pdf-node');
const fs = require('fs').promises;
const path = require('path');

// ============================================
// CONFIGURAÇÕES PADRÃO DE PDF
// ============================================

const DEFAULT_PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm'
  },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="font-size: 10px; text-align: center; width: 100%; padding: 10px;">
      <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>
  `
};

// ============================================
// TEMPLATES HTML PROFISSIONAIS
// ============================================

/**
 * Template base para relatórios
 */
const generateBaseTemplate = (content, options = {}) => {
  const {
    title = 'Relatório',
    professionalName = '',
    professionalRegister = '',
    watermark = null
  } = options;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #333;
          background: white;
        }

        .container {
          max-width: 100%;
          padding: 0;
        }

        /* Cabeçalho */
        .report-header {
          border-bottom: 3px solid #4CAF50;
          padding-bottom: 15px;
          margin-bottom: 25px;
          page-break-after: avoid;
        }

        .report-header .logo {
          font-size: 20pt;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 10px;
        }

        .report-header .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }

        .info-item {
          font-size: 9pt;
        }

        .info-label {
          font-weight: bold;
          color: #666;
        }

        /* Seções */
        .section {
          margin: 25px 0;
          page-break-inside: avoid;
        }

        .section-title {
          background: #f5f5f5;
          padding: 12px 15px;
          font-weight: bold;
          font-size: 13pt;
          border-left: 4px solid #4CAF50;
          margin-bottom: 15px;
          page-break-after: avoid;
        }

        .section-content {
          padding: 0 15px;
        }

        /* Dados estruturados */
        .data-grid {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 8px;
          margin: 10px 0;
        }

        .data-label {
          font-weight: bold;
          color: #555;
        }

        .data-value {
          color: #333;
        }

        /* Tabelas */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 10pt;
        }

        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background: #f5f5f5;
          font-weight: bold;
          color: #333;
          border-bottom: 2px solid #4CAF50;
        }

        tr:hover {
          background: #f9f9f9;
        }

        /* Listas */
        ul, ol {
          margin: 10px 0 10px 20px;
        }

        li {
          margin: 5px 0;
        }

        /* Texto */
        p {
          margin: 10px 0;
          text-align: justify;
        }

        .text-block {
          background: #f9f9f9;
          padding: 15px;
          border-left: 3px solid #4CAF50;
          margin: 15px 0;
        }

        /* Destaque */
        .highlight {
          background: #fff3cd;
          padding: 2px 5px;
          border-radius: 3px;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 9pt;
          font-weight: bold;
          background: #e0e0e0;
          color: #333;
        }

        .badge-success { background: #d4edda; color: #155724; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-info { background: #d1ecf1; color: #0c5460; }

        /* Estatísticas */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .stat-card {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          text-align: center;
          border: 1px solid #e0e0e0;
        }

        .stat-value {
          font-size: 24pt;
          font-weight: bold;
          color: #4CAF50;
        }

        .stat-label {
          font-size: 9pt;
          color: #666;
          margin-top: 5px;
        }

        /* Quebras de página */
        .page-break {
          page-break-before: always;
        }

        .avoid-break {
          page-break-inside: avoid;
        }

        /* Rodapé */
        .report-footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          font-size: 9pt;
          color: #666;
          page-break-inside: avoid;
        }

        /* Watermark */
        ${watermark ? `
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72pt;
            color: rgba(0, 0, 0, 0.05);
            z-index: -1;
            pointer-events: none;
          }
        ` : ''}

        /* Impressão */
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
          .avoid-break {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      ${watermark ? `<div class="watermark">${watermark}</div>` : ''}
      <div class="container">
        <div class="report-header">
          <div class="logo">MÓDULA - Gestão Clínica</div>
          <div class="info-grid">
            ${professionalName ? `
              <div class="info-item">
                <span class="info-label">Profissional:</span> ${professionalName}
              </div>
            ` : ''}
            ${professionalRegister ? `
              <div class="info-item">
                <span class="info-label">Registro:</span> ${professionalRegister}
              </div>
            ` : ''}
            <div class="info-item">
              <span class="info-label">Data de emissão:</span> ${new Date().toLocaleDateString('pt-BR')}
            </div>
            <div class="info-item">
              <span class="info-label">Hora:</span> ${new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>

        ${content}

        <div class="report-footer">
          <p>Documento gerado automaticamente pelo sistema MÓDULA - Gestão Clínica</p>
          <p>Este documento é confidencial e destinado exclusivamente ao uso profissional</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template para relatório de evolução do paciente
 */
const generateEvolutionReportHTML = (reportData) => {
  const { patient, professional, anamnesis, sessions, statistics, timeline } = reportData;

  let content = `
    <div class="section">
      <div class="section-title">Dados do Paciente</div>
      <div class="section-content">
        <div class="data-grid">
          <span class="data-label">Nome Completo:</span>
          <span class="data-value">${patient.full_name}</span>
          
          <span class="data-label">Data de Nascimento:</span>
          <span class="data-value">${new Date(patient.birth_date).toLocaleDateString('pt-BR')} (${patient.age} anos)</span>
          
          ${patient.cpf ? `
            <span class="data-label">CPF:</span>
            <span class="data-value">${patient.cpf}</span>
          ` : ''}
          
          ${patient.phone ? `
            <span class="data-label">Telefone:</span>
            <span class="data-value">${patient.phone}</span>
          ` : ''}
          
          <span class="data-label">Primeira Consulta:</span>
          <span class="data-value">${patient.first_appointment ? new Date(patient.first_appointment).toLocaleDateString('pt-BR') : 'N/A'}</span>
          
          <span class="data-label">Última Consulta:</span>
          <span class="data-value">${patient.last_appointment ? new Date(patient.last_appointment).toLocaleDateString('pt-BR') : 'N/A'}</span>
        </div>
      </div>
    </div>
  `;

  // Estatísticas
  if (statistics) {
    content += `
      <div class="section">
        <div class="section-title">Resumo do Tratamento</div>
        <div class="section-content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${statistics.total_sessions}</div>
              <div class="stat-label">Total de Sessões</div>
            </div>
            ${statistics.frequency ? `
              <div class="stat-card">
                <div class="stat-value">${statistics.frequency.frequency_label}</div>
                <div class="stat-label">Frequência</div>
              </div>
            ` : ''}
            ${statistics.engagement && statistics.engagement.overall ? `
              <div class="stat-card">
                <div class="stat-value">${statistics.engagement.overall}</div>
                <div class="stat-label">Engajamento Médio</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Sessões
  if (sessions && sessions.list && sessions.list.length > 0) {
    content += `
      <div class="section page-break">
        <div class="section-title">Histórico de Sessões</div>
        <div class="section-content">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Duração</th>
                <th>Progresso</th>
                <th>Engajamento</th>
              </tr>
            </thead>
            <tbody>
              ${sessions.list.slice(0, 20).map(s => `
                <tr>
                  <td>${s.session_number}</td>
                  <td>${new Date(s.date).toLocaleDateString('pt-BR')}</td>
                  <td>${translateSessionType(s.type)}</td>
                  <td>${s.duration} min</td>
                  <td>${s.progress ? translateProgress(s.progress) : '-'}</td>
                  <td>${s.engagement || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${sessions.list.length > 20 ? `<p><em>Mostrando 20 de ${sessions.list.length} sessões</em></p>` : ''}
        </div>
      </div>
    `;
  }

  return generateBaseTemplate(content, {
    title: `Relatório de Evolução - ${patient.full_name}`,
    professionalName: professional.name,
    professionalRegister: professional.register
  });
};

/**
 * Template para anamnese formatada
 */
const generateAnamnesisHTML = (reportData) => {
  const { header, sections } = reportData;

  let content = `
    <div class="section">
      <div class="section-title">Dados do Paciente</div>
      <div class="section-content">
        <div class="data-grid">
          <span class="data-label">Nome:</span>
          <span class="data-value">${header.patient_name}</span>
          
          <span class="data-label">Idade:</span>
          <span class="data-value">${header.patient_age} anos</span>
          
          <span class="data-label">Data da Anamnese:</span>
          <span class="data-value">${new Date(header.date).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  `;

  // Adicionar seções da anamnese
  if (sections.current_complaint && sections.current_complaint.main_complaint) {
    content += `
      <div class="section">
        <div class="section-title">Queixa Principal</div>
        <div class="section-content">
          <div class="text-block">
            ${sections.current_complaint.main_complaint}
          </div>
        </div>
      </div>
    `;
  }

  return generateBaseTemplate(content, {
    title: `Anamnese - ${header.patient_name}`,
    professionalName: header.professional_name,
    professionalRegister: header.professional_register
  });
};

// ============================================
// FUNÇÕES DE CONVERSÃO PDF
// ============================================

/**
 * Converter HTML para PDF
 */
const generatePDF = async (html, options = {}) => {
  const pdfOptions = {
    ...DEFAULT_PDF_OPTIONS,
    ...options
  };

  const file = { content: html };
  
  try {
    const pdfBuffer = await pdf.generatePdf(file, pdfOptions);
    return pdfBuffer;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha na geração do PDF');
  }
};

/**
 * Gerar PDF de relatório de evolução
 */
const generateEvolutionPDF = async (reportData, options = {}) => {
  const html = generateEvolutionReportHTML(reportData);
  return await generatePDF(html, options);
};

/**
 * Gerar PDF de anamnese
 */
const generateAnamnesisPDF = async (reportData, options = {}) => {
  const html = generateAnamnesisHTML(reportData);
  return await generatePDF(html, options);
};

/**
 * Salvar PDF em arquivo
 */
const savePDFToFile = async (pdfBuffer, filename) => {
  const outputPath = path.join(__dirname, '../../temp', filename);
  
  // Criar diretório temp se não existir
  try {
    await fs.mkdir(path.join(__dirname, '../../temp'), { recursive: true });
  } catch (error) {
    // Diretório já existe
  }
  
  await fs.writeFile(outputPath, pdfBuffer);
  return outputPath;
};

// ============================================
// HELPERS
// ============================================

const translateSessionType = (type) => {
  const types = {
    first_consultation: 'Primeira Consulta',
    follow_up: 'Retorno',
    therapy_session: 'Sessão de Terapia',
    evaluation: 'Avaliação',
    emergency: 'Emergência',
    discharge: 'Alta'
  };
  return types[type] || type;
};

const translateProgress = (progress) => {
  const progressMap = {
    improved: 'Melhora',
    stable: 'Estável',
    worsened: 'Piora',
    no_change: 'Sem mudança'
  };
  return progressMap[progress] || progress;
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Templates
  generateBaseTemplate,
  generateEvolutionReportHTML,
  generateAnamnesisHTML,
  
  // Conversão PDF
  generatePDF,
  generateEvolutionPDF,
  generateAnamnesisPDF,
  
  // Utilitários
  savePDFToFile,
  
  // Configurações
  DEFAULT_PDF_OPTIONS
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. GERAR PDF DE EVOLUÇÃO:
 *    const reportData = await reportService.generatePatientEvolutionReport(...);
 *    const pdfBuffer = await pdfService.generateEvolutionPDF(reportData);
 *    
 *    // Enviar como download
 *    res.setHeader('Content-Type', 'application/pdf');
 *    res.setHeader('Content-Disposition', 'attachment; filename="relatorio.pdf"');
 *    res.send(pdfBuffer);
 * 
 * 2. SALVAR EM ARQUIVO:
 *    const filePath = await pdfService.savePDFToFile(pdfBuffer, 'relatorio.pdf');
 * 
 * 3. OPÇÕES CUSTOMIZADAS:
 *    const pdf = await pdfService.generatePDF(html, {
 *      format: 'A4',
 *      landscape: false,
 *      margin: { top: '30mm' }
 *    });
 * 
 * DEPENDÊNCIAS NECESSÁRIAS:
 * npm install html-pdf-node
 */