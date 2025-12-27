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
// Recebe agora o 'totalBruto' explicitamente para usar na fórmula do Redutor
function calcularIRRF(baseBruta, inssCalculado, dependentes, totalBruto, regras) {
  
  // 1. CHECAGEM DE ISENÇÃO PELO BRUTO (Até R$ 5.000,00)
  if (regras.novaRegra2026 && regras.novaRegra2026.ativo) {
     // Se a Renda Tributável (Bruto) for até 5000, isenta direto.
     if (totalBruto <= regras.novaRegra2026.limiteIsencaoBruto) {
        return 0;
     }
  }

  // 2. CÁLCULO DO IMPOSTO "NORMAL" (Tabela Progressiva)
  // Precisamos achar o imposto devido antes do redutor. 
  // O sistema continua escolhendo a melhor base (Legal vs Simplificada).
  
  const baseLegal = baseBruta - inssCalculado - (dependentes * regras.deducaoPorDependenteIRRF);
  const baseSimplificada = baseBruta - regras.descontoSimplificado;

  let baseFinal = Math.min(baseLegal, baseSimplificada);
  if (baseFinal < 0) baseFinal = 0;

  let impostoCalculado = 0;
  for (const faixa of regras.tabelaIRRF) {
    if (faixa.ate === "acima" || baseFinal <= faixa.ate) {
      impostoCalculado = (baseFinal * faixa.aliquota) - faixa.deduzir;
      break;
    }
  }

  // 3. APLICAR O REDUTOR (Se estiver na faixa de transição do BRUTO)
  if (regras.novaRegra2026 && regras.novaRegra2026.ativo) {
    // A regra do redutor se aplica se o BRUTO estiver entre 5.000 e 7.350
    if (totalBruto > regras.novaRegra2026.limiteIsencaoBruto && 
        totalBruto <= regras.novaRegra2026.faixaTransicaoFim) {
        
        // FÓRMULA CORRETA: Redução = 978,62 - (0,133145 x RendaTributável/Bruto)
        const valorRedutor = regras.novaRegra2026.parcelaFixaRedutor - (regras.novaRegra2026.fatorRedutor * totalBruto);
        
        // Abate o redutor do imposto apurado na tabela
        if (valorRedutor > 0) {
            impostoCalculado -= valorRedutor;
        }
    }
  }

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

  // --- Descontos ---
  const fgts = totalBruto * 0.08;
  const descontoFaltas = faltas * valorDia;
  const descontoAtrasos = atrasos * valorHora;
  const adiantamento = (salario / 30) * diasTrab * regras.percentualAdiantamento;
  const descontoVA = regras.descontoFixoVA;
  const descontoVT = descontarVT ? (salario * regras.percentualVT) : 0;
  
  // 1. INSS
  const inss = calcularINSS(totalBruto, regras);
  
  // 2. IRRF (Passando o totalBruto para a lógica do redutor)
  // 'totalBruto' aqui atua como a "Renda Tributável" para fins da Lei 15.270
  const irrf = calcularIRRF(totalBruto, inss, dependentes, totalBruto, regras);

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
