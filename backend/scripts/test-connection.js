/**
 * MÓDULA - SCRIPT DE TESTE DE CONEXÃO
 * 
 * Testa a conexão com o PostgreSQL antes de criar o banco
 * 
 * COMO USAR:
 * node backend/scripts/test-connection.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

async function testConnection() {
  console.log('🔍 Testando conexão com PostgreSQL...\n');
  
  console.log('📋 Configurações:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}\n`);

  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!\n');
    console.log('🎉 Banco de dados está pronto para ser inicializado.\n');
    console.log('Execute agora: node backend/scripts/init-database.js\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Não foi possível conectar ao banco de dados:\n');
    console.error(`   Erro: ${error.message}\n`);
    
    console.log('💡 Possíveis soluções:\n');
    console.log('1. Verifique se o PostgreSQL está rodando:');
    console.log('   sudo systemctl status postgresql\n');
    console.log('2. Verifique se o database existe:');
    console.log('   sudo -u postgres psql -c "\\l"\n');
    console.log('3. Verifique as credenciais no arquivo .env\n');
    console.log('4. Crie o database se não existir:');
    console.log('   sudo -u postgres createdb modula\n');
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testConnection();
