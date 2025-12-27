// Funções auxiliares (internas)
function calcularINSS(baseDeCalculo, regras) {
  if (baseDeCalculo > regras.tetoINSS) {
    baseDeCalculo = regras.tetoINSS;
  }
  for (const faixa of regras.tabelaINSS) {
    if (baseDeCalculo <= faixa.ate) {
      return (baseDeCalculo * faixa.aliquota) - faixa.deduzir;
    }
  }
  const ultimaFaixa = regras.tabelaINSS[regras.tabelaINSS.length - 1];
  return (baseDeCalculo * ultimaFaixa.aliquota) - ultimaFaixa.deduzir;
}

// --- LÓGICA DE IRRF 2026 (LEI 15.270) ---
function calcularIRRF(baseBruta, inssCalculado, dependentes, regras) {
  // 1. Cenário A: Base Legal (Deduções Clássicas)
  const baseLegal = baseBruta - inssCalculado - (dependentes * regras.deducaoPorDependenteIRRF);
  
  // 2. Cenário B: Base Simplificada (Desconto Padrão)
  // Nota: O desconto simplificado substitui TODAS as outras deduções (INSS e Dependentes)
  const baseSimplificada = baseBruta - regras.descontoSimplificado;

  // 3. Escolher o melhor cenário para o funcionário (menor base de imposto)
  let baseFinal = Math.min(baseLegal, baseSimplificada);
  if (baseFinal < 0) baseFinal = 0;

  // 4. Calcular o Imposto "Padrão" (usando a tabela vigente)
  let impostoCalculado = 0;
  for (const faixa of regras.tabelaIRRF) {
    if (faixa.ate === "acima" || baseFinal <= faixa.ate) {
      impostoCalculado = (baseFinal * faixa.aliquota) - faixa.deduzir;
      break;
    }
  }

  // 5. APLICAR O REDUTOR DA LEI 15.270 (Se estiver na faixa de transição)
  if (regras.novaRegra2026 && regras.novaRegra2026.ativo) {
    
    // CASO 1: Isenção Total (Até 5k de base)
    if (baseFinal <= regras.novaRegra2026.limiteIsencao) {
      return 0; // Imposto Zero!
    }
    
    // CASO 2: Faixa de Transição (Entre 5k e 7.35k)
    else if (baseFinal <= regras.novaRegra2026.faixaTransicaoFim) {
        // Fórmula Oficial: 978.61 - (0.133145 * Base)
        const valorRedutor = regras.novaRegra2026.parcelaFixaRedutor - (regras.novaRegra2026.fatorRedutor * baseFinal);
        
        // Se o redutor for positivo, abatemos do imposto calculado
        if (valorRedutor > 0) {
            impostoCalculado -= valorRedutor;
        }
    }
  }

  // Trava de segurança (nunca negativo)
  return Math.max(0, impostoCalculado);
}

// Função Principal Exportada
export function calcularSalarioCompleto(inputs, regras) {
  const { salario, diasTrab, dependentes, faltas, atrasos, he50, he60, he80, he100, he150, noturno, plano, sindicato, emprestimo, diasUteis, domFeriados, descontarVT } = inputs;

  const valorDia = salario / 30;
  const valorHora = salario / 220;

  // --- Proventos ---
  const vencBase = valorDia * diasTrab;
  const valorHE50 = he50 * valorHora * 1.5;
  const valorHE60 = he60 * valorHora * 1.6;
  const valorHE80 = he80 * valorHora * 1.8;
  const valorHE100 = he100 * valorHora * 2.0;
  const valorHE150 = he150 * valorHora * 2.5;
  const valorNoturno = noturno * valorHora * regras.percentualAdicionalNoturno;
  
  const totalHE = valorHE50 + valorHE60 + valorHE80 + valorHE100 + valorHE150;
  const dsrHE = (diasUteis > 0) ? (totalHE / diasUteis) * domFeriados : 0;
  const dsrNoturno = (diasUteis > 0) ? (valorNoturno / diasUteis) * domFeriados : 0;

  const totalBruto = vencBase + totalHE + valorNoturno + dsrHE + dsrNoturno;

  // --- Descontos Iniciais ---
  const fgts = totalBruto * 0.08;
  const descontoFaltas = faltas * valorDia;
  const descontoAtrasos = atrasos * valorHora;
  const adiantamento = (salario / 30) * diasTrab * regras.percentualAdiantamento;
  const descontoVA = regras.descontoFixoVA;
  const descontoVT = descontarVT ? (salario * regras.percentualVT) : 0;
  
  // 1. Calcular INSS
  const inss = calcularINSS(totalBruto, regras);
  
  // 2. Calcular IRRF (Agora com a nova regra de base dupla + redutor 2026)
  // Nota: Passamos o 'totalBruto' e o 'inss' para a função decidir qual base usar
  const irrf = calcularIRRF(totalBruto, inss, dependentes, regras);

  const descontoPlano = regras.planosSESI[plano] || 0;
  const descontoSindicato = sindicato === 'sim' ? regras.valorSindicato : 0;

  const totalDescontos = descontoFaltas + descontoAtrasos + descontoPlano + descontoSindicato + emprestimo + inss + irrf + descontoVA + adiantamento + descontoVT;
  const liquido = totalBruto - totalDescontos;

  return {
    proventos: { vencBase, valorHE50, valorHE60, valorHE80, valorHE100, valorHE150, valorNoturno, dsrHE, dsrNoturno, totalBruto },
    descontos: { descontoFaltas, descontoAtrasos, descontoPlano, descontoSindicato, emprestimo, inss, irrf, adiantamento, descontoVA, descontoVT, totalDescontos },
    fgts,
    liquido
  };
}
