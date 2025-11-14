/**
 * MÓDULA - SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS
 * 
 * Este script:
 * 1. Conecta ao PostgreSQL
 * 2. Cria todas as tabelas conforme os modelos Sequelize
 * 3. Cria o usuário admin padrão
 * 4. Popula dados de exemplo (opcional)
 * 
 * COMO USAR:
 * node backend/scripts/init-database.js
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

// Importar todos os modelos
const {
  User,
  Patient,
  Anamnesis,
  Session,
  Transfer,
  Notification,
  AuditLog
} = require('../src/models');

async function initDatabase() {
  try {
    console.log('🚀 Iniciando processo de criação do banco de dados...\n');

    // ============================================
    // PASSO 1: Testar Conexão
    // ============================================
    console.log('📡 Testando conexão com o banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // ============================================
    // PASSO 2: Criar Tabelas
    // ============================================
    console.log('📋 Criando tabelas no banco de dados...');
    console.log('   Isso pode levar alguns segundos...\n');

    // sync({ force: true }) = DROP todas as tabelas e recria do zero
    // sync({ alter: true }) = Ajusta as tabelas existentes
    // sync() = Cria apenas se não existir
    
    await sequelize.sync({ force: true }); // ⚠️ CUIDADO: Apaga tudo e recria!
    
    console.log('✅ Tabelas criadas com sucesso!\n');
    
    console.log('📊 Tabelas criadas:');
    console.log('   ✓ users');
    console.log('   ✓ patients');
    console.log('   ✓ anamnesis');
    console.log('   ✓ sessions');
    console.log('   ✓ transfers');
    console.log('   ✓ notifications');
    console.log('   ✓ audit_logs\n');

    // ============================================
    // PASSO 3: Criar Usuário Admin Padrão
    // ============================================
    console.log('👤 Criando usuário administrador padrão...');
    
    const adminExists = await User.findOne({
      where: { email: 'admin@modula.com' }
    });

    if (!adminExists) {
      const adminUser = await User.create({
        full_name: 'Administrador Sistema',
        email: 'admin@modula.com',
        password: 'Admin@2025', // Será hasheado automaticamente pelo hook
        user_type: 'admin',
        status: 'active',
        is_first_access: false,
        professional_register: null
      });

      console.log('✅ Usuário admin criado com sucesso!');
      console.log('   📧 Email: admin@modula.com');
      console.log('   🔑 Senha: Admin@2025\n');
    } else {
      console.log('ℹ️  Usuário admin já existe, pulando...\n');
    }

    // ============================================
    // PASSO 4: Criar Profissional de Exemplo
    // ============================================
    console.log('👨‍⚕️ Criando profissional de exemplo...');
    
    const professionalExists = await User.findOne({
      where: { email: 'psicologo@modula.com' }
    });

    let professionalUser;
    if (!professionalExists) {
      professionalUser = await User.create({
        full_name: 'Dr. João Silva',
        email: 'psicologo@modula.com',
        password: 'Psi@2025',
        user_type: 'professional',
        status: 'active',
        is_first_access: false,
        professional_register: 'CRP 06/123456'
      });

      console.log('✅ Profissional criado com sucesso!');
      console.log('   📧 Email: psicologo@modula.com');
      console.log('   🔑 Senha: Psi@2025');
      console.log('   📋 Registro: CRP 06/123456\n');
    } else {
      professionalUser = professionalExists;
      console.log('ℹ️  Profissional já existe, pulando...\n');
    }

    // ============================================
    // PASSO 5: Criar Paciente de Exemplo (Opcional)
    // ============================================
    console.log('🏥 Criando paciente de exemplo...');
    
    const patientExists = await Patient.findOne({
      where: { cpf: '12345678900' }
    });

    let patient;
    if (!patientExists && professionalUser) {
      patient = await Patient.create({
        user_id: professionalUser.id,
        full_name: 'Maria Santos',
        birth_date: '1990-05-15',
        gender: 'female',
        cpf: '12345678900',
        phone: '11999998888',
        email: 'maria.santos@email.com',
        status: 'active',
        address: {
          street: 'Rua Exemplo',
          number: '123',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '01234-567'
        },
        emergency_contact: {
          name: 'José Santos',
          relationship: 'spouse',
          phone: '11999997777'
        }
      });

      console.log('✅ Paciente criado com sucesso!');
      console.log('   👤 Nome: Maria Santos');
      console.log('   📱 CPF: 123.456.789-00\n');
    } else {
      console.log('ℹ️  Paciente já existe ou profissional não encontrado, pulando...\n');
    }

    // ============================================
    // PASSO 6: Criar Anamnese de Exemplo (Opcional)
    // ============================================
    if (patient) {
      console.log('📝 Criando anamnese de exemplo...');
      
      const anamnesisExists = await Anamnesis.findOne({
        where: { patient_id: patient.id }
      });

      if (!anamnesisExists) {
        await Anamnesis.create({
          patient_id: patient.id,
          user_id: professionalUser.id,
          status: 'in_progress',
          completion_percentage: 40,
          current_complaint: {
            main_complaint: 'Ansiedade e dificuldade para dormir',
            onset: {
              when: '3 meses atrás',
              trigger: 'Pressão no trabalho'
            },
            symptoms: [
              {
                symptom: 'insônia',
                frequency: 'diária',
                intensity: 8
              }
            ]
          },
          identification: {
            education_level: 'superior_completo',
            occupation: 'Engenheira',
            marital_status: 'married'
          }
        });

        console.log('✅ Anamnese criada com sucesso!\n');
      } else {
        console.log('ℹ️  Anamnese já existe, pulando...\n');
      }
    }

    // ============================================
    // PASSO 7: Criar Sessão de Exemplo (Opcional)
    // ============================================
    if (patient) {
      console.log('📅 Criando sessão de exemplo...');
      
      const sessionExists = await Session.findOne({
        where: { patient_id: patient.id }
      });

      if (!sessionExists) {
        const sessionDate = new Date();
        sessionDate.setHours(14, 0, 0, 0); // 14:00 hoje

        await Session.create({
          patient_id: patient.id,
          user_id: professionalUser.id,
          session_number: 1,
          session_date: sessionDate,
          session_type: 'first_consultation',
          duration_minutes: 50,
          status: 'completed',
          session_notes: 'Primeira consulta. Paciente apresenta sintomas de ansiedade relacionados ao trabalho.',
          patient_mood: 'anxious',
          progress_assessment: 'stable',
          patient_engagement: 7,
          main_topics: ['ansiedade', 'trabalho', 'sono'],
          is_billable: true,
          session_value: 150.00,
          payment_status: 'paid',
          payment_method: 'card'
        });

        console.log('✅ Sessão criada com sucesso!\n');
      } else {
        console.log('ℹ️  Sessão já existe, pulando...\n');
      }
    }

    // ============================================
    // PASSO 8: Criar Log de Auditoria
    // ============================================
    console.log('📋 Criando log de auditoria inicial...');
    
    await AuditLog.create({
      user_id: null,
      user_email: 'system@modula.com',
      user_name: 'Sistema',
      user_role: 'system',
      action: 'CREATE',
      resource: 'system',
      resource_id: null,
      description: 'Banco de dados inicializado com sucesso',
      ip_address: '127.0.0.1',
      status: 'success',
      metadata: {
        tables_created: 7,
        admin_created: true,
        sample_data: true
      },
      retention_until: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) // 5 anos
    });

    console.log('✅ Log de auditoria criado!\n');

    // ============================================
    // RESUMO FINAL
    // ============================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ BANCO DE DADOS INICIALIZADO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📊 RESUMO:');
    console.log('   ✓ 7 tabelas criadas');
    console.log('   ✓ Usuário admin criado');
    console.log('   ✓ Profissional de exemplo criado');
    console.log('   ✓ Paciente de exemplo criado');
    console.log('   ✓ Anamnese de exemplo criada');
    console.log('   ✓ Sessão de exemplo criada');
    console.log('   ✓ Log de auditoria registrado\n');
    
    console.log('🔐 CREDENCIAIS DE ACESSO:');
    console.log('   Admin:');
    console.log('   • Email: admin@modula.com');
    console.log('   • Senha: Admin@2025\n');
    console.log('   Profissional:');
    console.log('   • Email: psicologo@modula.com');
    console.log('   • Senha: Psi@2025\n');
    
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('   1. Inicie o servidor: npm run dev');
    console.log('   2. Acesse: http://localhost:3000');
    console.log('   3. Faça login com as credenciais acima');
    console.log('   4. Explore o sistema!\n');
    
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ ERRO ao inicializar banco de dados:', error);
    console.error('\n📝 Detalhes do erro:', error.message);
    console.error('\n💡 Verifique:');
    console.error('   • PostgreSQL está rodando?');
    console.error('   • Credenciais no .env estão corretas?');
    console.error('   • Database "modula" foi criado?');
    console.error('   • Usuário tem permissões corretas?\n');
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('📡 Conexão com banco de dados encerrada.\n');
  }
}

// Executar
initDatabase();
