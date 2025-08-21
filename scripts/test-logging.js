#!/usr/bin/env node

/**
 * Script de teste para demonstrar o sistema de logging
 * Execute com: node scripts/test-logging.js
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testLogging() {
  console.log('🧪 Testando Sistema de Logging...\n');
  
  const tests = [
    {
      name: 'Teste de Notícias em Português',
      url: `${BASE_URL}/api/news?category=usd-brl&lang=pt&pageSize=5`,
      method: 'GET'
    },
    {
      name: 'Teste de Notícias em Inglês',
      url: `${BASE_URL}/api/news?category=global-markets&lang=en&pageSize=5`,
      method: 'GET'
    },
    {
      name: 'Teste de Notícias em Espanhol',
      url: `${BASE_URL}/api/news?category=emerging-markets&lang=es&pageSize=5`,
      method: 'GET'
    },
    {
      name: 'Teste de Mercado',
      url: `${BASE_URL}/api/market`,
      method: 'GET'
    },
    {
      name: 'Teste de Eventos',
      url: `${BASE_URL}/api/events`,
      method: 'GET'
    },
    {
      name: 'Teste de Score',
      url: `${BASE_URL}/api/score`,
      method: 'GET'
    },
    {
      name: 'Teste de Configuração (GET)',
      url: `${BASE_URL}/api/config`,
      method: 'GET'
    },
    {
      name: 'Teste de Configuração (POST)',
      url: `${BASE_URL}/api/config`,
      method: 'POST',
      data: {
        NEWS_API_KEY: 'test_key_12345',
        RAPIDAPI_KEY: 'test_rapid_67890'
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 ${test.name}`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Método: ${test.method}`);
      
      const startTime = Date.now();
      
      let response;
      if (test.method === 'POST') {
        response = await axios.post(test.url, test.data, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Test-Logging-Script/1.0'
          }
        });
      } else {
        response = await axios.get(test.url, {
          headers: {
            'User-Agent': 'Test-Logging-Script/1.0'
          }
        });
      }
      
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ⏱️  Duração: ${duration}ms`);
      console.log(`   📊 Tamanho da resposta: ${JSON.stringify(response.data).length} chars`);
      
      // Verificar metadados se disponíveis
      if (response.data.metadata) {
        console.log(`   🔍 Metadados: ${Object.keys(response.data.metadata).join(', ')}`);
      }
      
      // Verificar headers de resposta
      const requestId = response.headers['x-request-id'];
      const responseTime = response.headers['x-response-time'];
      
      if (requestId) {
        console.log(`   🆔 Request ID: ${requestId}`);
      }
      if (responseTime) {
        console.log(`   ⚡ Response Time: ${responseTime}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      if (error.response) {
        console.log(`      Status: ${error.response.status}`);
        console.log(`      Dados: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
      }
    }
    
    console.log(''); // Linha em branco entre testes
  }
  
  console.log('🎯 Testes concluídos!');
  console.log('📝 Verifique os logs no console ou arquivo de log configurado.');
  console.log('🔍 Use o Request ID para rastrear cada requisição nos logs.');
}

async function testCacheBehavior() {
  console.log('\n🧠 Testando Comportamento de Cache...\n');
  
  try {
    // Primeira requisição (cache miss)
    console.log('📡 Primeira requisição (esperado: cache miss)');
    const start1 = Date.now();
    const response1 = await axios.get(`${BASE_URL}/api/news?category=usd-brl&lang=pt&pageSize=3`);
    const duration1 = Date.now() - start1;
    console.log(`   ⏱️  Duração: ${duration1}ms`);
    console.log(`   🆔 Request ID: ${response1.headers['x-request-id']}`);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Segunda requisição (esperado: cache hit)
    console.log('\n📡 Segunda requisição (esperado: cache hit)');
    const start2 = Date.now();
    const response2 = await axios.get(`${BASE_URL}/api/news?category=usd-brl&lang=pt&pageSize=3`);
    const duration2 = Date.now() - start2;
    console.log(`   ⏱️  Duração: ${duration2}ms`);
    console.log(`   🆔 Request ID: ${response2.headers['x-request-id']}`);
    
    console.log(`\n📊 Comparação de performance:`);
    console.log(`   Cache Miss: ${duration1}ms`);
    console.log(`   Cache Hit:  ${duration2}ms`);
    console.log(`   Melhoria:   ${Math.round(((duration1 - duration2) / duration1) * 100)}%`);
    
  } catch (error) {
    console.log(`   ❌ Erro no teste de cache: ${error.message}`);
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testando Tratamento de Erros...\n');
  
  try {
    // Teste com parâmetros inválidos
    console.log('📡 Teste com parâmetros inválidos');
    const response = await axios.get(`${BASE_URL}/api/news?category=invalid&lang=xx&pageSize=-1`);
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   🆔 Request ID: ${response.headers['x-request-id']}`);
    
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ Status: ${error.response.status}`);
      console.log(`   🆔 Request ID: ${error.response.headers['x-request-id']}`);
      console.log(`   📝 Erro: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
    } else {
      console.log(`   ❌ Erro de rede: ${error.message}`);
    }
  }
}

// Executar todos os testes
async function runAllTests() {
  try {
    await testLogging();
    await testCacheBehavior();
    await testErrorHandling();
    
    console.log('\n🎉 Todos os testes foram executados!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('   ✅ Todas as rotas da API');
    console.log('   ✅ Suporte multilíngue (PT/EN/ES)');
    console.log('   ✅ Sistema de cache');
    console.log('   ✅ Tratamento de erros');
    console.log('   ✅ Headers de resposta');
    console.log('   ✅ Metadados das respostas');
    
  } catch (error) {
    console.error('\n💥 Erro durante os testes:', error.message);
    process.exit(1);
  }
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/config`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando Testes do Sistema de Logging\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Servidor não está rodando!');
    console.log(`   Certifique-se de que o servidor está rodando em: ${BASE_URL}`);
    console.log('   Execute: npm run dev ou npm start');
    process.exit(1);
  }
  
  console.log(`✅ Servidor detectado em: ${BASE_URL}\n`);
  
  await runAllTests();
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testLogging, testCacheBehavior, testErrorHandling };