# 📋 GUIA DE TRANSFERÊNCIAS PARA ADMINISTRADORES

## 🎯 Visão Geral

O sistema de transferências permite que profissionais solicitem a mudança de pacientes entre colegas, com aprovação administrativa obrigatória.

---

## 📊 Dashboard Atualizado

### Endpoint
```
GET /api/admin/dashboard
```

### Novos Dados Incluídos
```json
{
  "transfers": {
    "total": 45,
    "by_status": {
      "pending": 3,
      "approved": 25,
      "rejected": 5,
      "completed": 12
    },
    "metrics": {
      "approval_rate": 83.33,
      "pending_action_required": 3
    },
    "recent_transfers": [...]
  }
}
```

### Alertas Automáticos
- ⚠️ **Warning:** Transferências pendentes (alta prioridade)
- ℹ️ **Info:** Profissionais inativos
- ℹ️ **Info:** Anamneses não finalizadas

---

## 🔔 Widget de Transferências Pendentes

### Endpoint
```
GET /api/admin/widgets/pending-transfers?limit=10
```

### Funcionalidades
- ✅ Lista transferências pendentes ordenadas por urgência
- ✅ Calcula tempo de espera (dias + horas)
- ✅ Classifica urgência:
  - 🔴 **Critical:** 7+ dias de espera
  - 🟠 **High:** 3-6 dias de espera
  - 🟡 **Medium:** 1-2 dias de espera
  - 🟢 **Low:** < 1 dia de espera

### Resposta
```json
{
  "pending_count": 5,
  "transfers": [
    {
      "id": "uuid",
      "patient": { "name": "João Silva", "cpf": "123.456.789-00" },
      "from_professional": { "name": "Dr. Pedro", "register": "CRP 12345" },
      "to_professional": { "name": "Dra. Maria", "register": "CRP 67890" },
      "reason": "Paciente solicitou mudança...",
      "wait_time": { "days": 3, "hours": 5, "display": "3d 5h" },
      "urgency": "high"
    }
  ],
  "summary": {
    "critical": 1,
    "high": 2,
    "medium": 1,
    "low": 1
  }
}
```

---

## ✅ Aprovar Transferência

### Endpoint
```
PUT /api/admin/transfers/:id/approve
```

### Body
```json
{
  "notes": "Transferência aprovada. Especialidade compatível.",
  "auto_complete": true  // default: true (efetiva imediatamente)
}
```

### Processo Automático (auto_complete = true)
1. ✅ Status: pending → approved
2. ✅ Paciente transferido automaticamente
3. ✅ Status: approved → completed
4. ✅ Snapshot salvo para auditoria
5. ✅ Histórico preservado

### Resposta
```json
{
  "success": true,
  "message": "Transferência aprovada e concluída com sucesso",
  "data": {
    "transfer": {...},
    "patient": {...},
    "from": {...},
    "to": {...}
  }
}
```

---

## ❌ Rejeitar Transferência

### Endpoint
```
PUT /api/admin/transfers/:id/reject
```

### Body
```json
{
  "reason": "Profissional destino não tem disponibilidade no momento."
}
```

### Validações
- ⚠️ Motivo obrigatório (10-1000 caracteres)
- ⚠️ Apenas transferências pendentes
- ⚠️ Profissional solicitante será notificado

### Resposta
```json
{
  "success": true,
  "message": "Transferência rejeitada",
  "data": {
    "transfer": {...},
    "rejection_reason": "..."
  }
}
```

---

## 📝 Histórico Completo

### Endpoint
```
GET /api/admin/transfers/history
```

### Query Params
```
?page=1
&limit=20
&status=completed           // pending|approved|rejected|completed|cancelled
&from_date=2025-01-01
&to_date=2025-12-31
&patient_id=uuid           // filtrar por paciente específico
&professional_id=uuid      // filtrar por profissional (enviadas/recebidas)
```

### Casos de Uso
1. **Auditoria:** Ver todas as transferências de um profissional
2. **Compliance:** Relatórios por período
3. **Investigação:** Histórico completo de um paciente

---

## 📊 Relatório Detalhado

### Endpoint
```
GET /api/admin/reports/transfers
```

### Query Params
```
?start_date=2025-01-01
&end_date=2025-12-31
&professional_id=uuid      // opcional
&group_by=month           // day|week|month|year
```

### Dados Incluídos
```json
{
  "period": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  },
  "statistics": {
    "total": 50,
    "by_status": {
      "pending": 5,
      "approved": 30,
      "rejected": 10,
      "completed": 5
    },
    "metrics": {
      "approval_rate": 75.00,
      "pending_action_required": 5
    }
  },
  "transfers_list": [...],
  "top_professionals": [
    {
      "professional_id": "uuid",
      "name": "Dr. João Silva",
      "sent": 15,
      "received": 10,
      "total": 25
    }
  ],
  "common_reasons": [
    { "keyword": "disponibilidade", "count": 12 },
    { "keyword": "especialidade", "count": 8 }
  ]
}
```

### Análises Disponíveis
- ✅ **Estatísticas gerais:** Total, por status, taxa de aprovação
- ✅ **Profissionais mais ativos:** Top 10 que mais enviam/recebem
- ✅ **Motivos comuns:** Análise de palavras-chave
- ✅ **Timeline:** Lista completa ordenada cronologicamente

---

## ⚡ Ações em Lote

### Endpoint
```
POST /api/admin/transfers/bulk-action
```

### Body - Aprovar Múltiplas
```json
{
  "transfer_ids": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ],
  "action": "approve",
  "notes": "Lote aprovado após análise."
}
```

### Body - Rejeitar Múltiplas
```json
{
  "transfer_ids": [
    "uuid-4",
    "uuid-5"
  ],
  "action": "reject",
  "reason": "Profissionais destino sem disponibilidade confirmada."
}
```

### Validações
- ✅ Mínimo 1 ID na lista
- ✅ Todos IDs devem ser UUIDs válidos
- ✅ Ação deve ser "approve" ou "reject"
- ✅ Motivo obrigatório para rejeição em lote

### Resposta
```json
{
  "success": true,
  "message": "3 transferência(s) processada(s)",
  "data": {
    "processed": 3,
    "failed": 0,
    "results": {
      "success": [
        { "transfer_id": "uuid-1", "status": "completed" },
        { "transfer_id": "uuid-2", "status": "completed" },
        { "transfer_id": "uuid-3", "status": "completed" }
      ],
      "failed": []
    }
  }
}
```

### Casos de Uso
1. **Aprovação rápida:** Aprovar múltiplas transferências similares
2. **Rejeição em massa:** Rejeitar transferências por motivo comum
3. **Limpeza de backlog:** Processar transferências acumuladas

---

## 📈 Estatísticas

### Endpoint
```
GET /api/admin/transfers/stats
```

### Query Params (Opcionais)
```
?start_date=2025-01-01
&end_date=2025-12-31
&user_id=uuid              // filtrar por profissional específico
```

### Métricas Calculadas
```json
{
  "total": 50,
  "by_status": {
    "pending": 3,
    "approved": 25,
    "rejected": 5,
    "completed": 17,
    "cancelled": 0
  },
  "metrics": {
    "approval_rate": 83.33,
    "processed": 30,
    "pending_percentage": 6.00
  },
  "recent_transfers": [...]  // Últimas 5
}
```

### KPIs Principais
- **Taxa de Aprovação:** (aprovadas / processadas) × 100
- **Percentual Pendente:** (pendentes / total) × 100
- **Total Processado:** aprovadas + rejeitadas

---

## 🔍 Detalhes de Transferência

### Endpoint
```
GET /api/admin/transfers/:id
```

### Informações Completas
```json
{
  "id": "uuid",
  "status": "pending",
  "patient": {
    "id": "uuid",
    "full_name": "João Silva",
    "cpf": "123.456.789-00",
    "birth_date": "1990-01-15"
  },
  "from_user": {
    "id": "uuid",
    "full_name": "Dr. Pedro Santos",
    "email": "pedro@clinica.com",
    "professional_register": "CRP 12345"
  },
  "to_user": {
    "id": "uuid",
    "full_name": "Dra. Maria Costa",
    "email": "maria@clinica.com",
    "professional_register": "CRP 67890"
  },
  "reason": "Paciente solicitou mudança para melhor compatibilidade de horários...",
  "requested_at": "2025-10-15T10:30:00Z",
  "processed_at": null,
  "processed_by": null,
  "metadata": {
    "sessions_count": 12,
    "last_appointment": "2025-10-10",
    "requested_by_name": "Dr. Pedro Santos",
    "target_professional_name": "Dra. Maria Costa"
  }
}
```

---

## 🔄 Fluxo Completo de Aprovação

### Cenário: Transferência Recebida

1. **Notificação**
   - Admin recebe alerta de nova transferência pendente
   - Widget mostra no dashboard com urgência calculada

2. **Análise**
   - Verificar motivo da transferência
   - Conferir dados do paciente (histórico, sessões)
   - Validar disponibilidade do profissional destino
   - Verificar especialidade compatível

3. **Decisão**
   ```
   ✅ APROVAR:
   - Motivo válido
   - Profissional destino adequado
   - Sem impedimentos
   
   ❌ REJEITAR:
   - Profissional destino sem disponibilidade
   - Especialidade incompatível
   - Falta de justificativa adequada
   ```

4. **Ação**
   ```bash
   # Aprovar (efetiva automaticamente)
   PUT /api/admin/transfers/:id/approve
   { "auto_complete": true }
   
   # OU Rejeitar (com motivo)
   PUT /api/admin/transfers/:id/reject
   { "reason": "Motivo detalhado..." }
   ```

5. **Confirmação**
   - Sistema efetiva a transferência (se aprovada)
   - Paciente muda de profissional automaticamente
   - Histórico preservado em snapshots
   - Ambos profissionais são notificados

---

## 📋 Checklist de Aprovação

### Antes de Aprovar
- [ ] Motivo da transferência é válido?
- [ ] Profissional destino está ativo?
- [ ] Especialidade do destino é compatível?
- [ ] Profissional destino tem disponibilidade?
- [ ] Não há conflitos éticos ou administrativos?
- [ ] Histórico do paciente foi revisado?

### Antes de Rejeitar
- [ ] Motivo da rejeição está claro?
- [ ] Justificativa tem mais de 10 caracteres?
- [ ] Profissional solicitante será informado adequadamente?
- [ ] Há alternativas para o caso?

---

## ⚠️ Situações Especiais

### Transferência Cancelada pelo Solicitante
```json
{
  "status": "cancelled",
  "cancelled_by": "uuid-do-profissional",
  "cancelled_at": "2025-10-16T14:20:00Z",
  "cancellation_reason": "Paciente desistiu da mudança"
}
```
- ℹ️ Não requer ação administrativa
- ℹ️ Mantida no histórico para auditoria

### Transferência Antiga (7+ dias)
- 🔴 **Urgência crítica** no widget
- ⚠️ Pode indicar sobrecarga administrativa
- 💡 Considerar processar em lote se houver muitas

### Transferência Entre Especialidades Diferentes
- 🔍 Revisar com atenção especial
- 📞 Considerar contato com ambos profissionais
- ✅ Garantir que é no melhor interesse do paciente

---

## 📊 Indicadores de Performance

### Métricas Recomendadas

**Taxa de Aprovação:**
- ✅ **Ótimo:** > 80%
- 🟡 **Atenção:** 60-80%
- 🔴 **Crítico:** < 60%

**Tempo de Resposta:**
- ✅ **Ótimo:** < 24 horas
- 🟡 **Atenção:** 24-72 horas
- 🔴 **Crítico:** > 72 horas (3 dias)

**Volume Pendente:**
- ✅ **Ótimo:** < 5 transferências
- 🟡 **Atenção:** 5-10 transferências
- 🔴 **Crítico:** > 10 transferências

---

## 🔐 Controles de Segurança

### Auditoria Automática
- ✅ Todos os processamentos são logados
- ✅ Admin responsável é registrado (processed_by)
- ✅ Timestamps de todas as ações
- ✅ Snapshots preservam estado original
- ✅ Histórico completo não pode ser deletado

### Restrições
- ⛔ Apenas admins podem aprovar/rejeitar
- ⛔ Não é possível deletar transferências
- ⛔ Transferências completadas não podem ser revertidas
- ⛔ Motivo de rejeição é obrigatório

---

## 💡 Dicas e Boas Práticas

### Para Aprovação Eficiente
1. **Use o widget de pendentes:** Prioriza por urgência automaticamente
2. **Aprove em lote:** Quando transferências são similares
3. **Adicione notas:** Facilita auditoria futura
4. **Revise histórico:** Antes de aprovar transferências repetidas

### Para Comunicação Clara
1. **Motivos de rejeição detalhados:** Ajuda profissionais a entenderem
2. **Use o campo de notas:** Adicione contexto quando necessário
3. **Verifique dados de contato:** Para casos que precisam discussão

### Para Monitoramento
1. **Confira dashboard diariamente:** Não deixe transferências acumularem
2. **Analise relatórios mensalmente:** Identifique padrões
3. **Monitore taxa de aprovação:** Indicador de qualidade das solicitações

---

## 🆘 Troubleshooting

### Problema: "Transferência não encontrada"
**Causa:** ID inválido ou transferência não existe
**Solução:** Verifique o UUID e tente novamente

### Problema: "Apenas transferências pendentes podem ser aprovadas"
**Causa:** Status já foi alterado
**Solução:** Confira status atual em /transfers/:id

### Problema: "Motivo da rejeição é obrigatório"
**Causa:** Campo reason vazio ou muito curto
**Solução:** Forneça motivo com no mínimo 10 caracteres

### Problema: Ação em lote falha parcialmente
**Causa:** Algumas transferências não estão pendentes
**Solução:** Verifique array "failed" na resposta para detalhes

---