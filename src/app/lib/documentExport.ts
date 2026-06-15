/**
 * RF10 — Geração de Documentação Automática
 *
 * Gera um PDF padronizado contendo todos os requisitos aprovados
 * (status_validacao = "Aprovado") de um projeto.
 *
 * Regras cobertas:
 *  - RN003: somente requisitos aprovados entram na documentação.
 *  - A6:    se não houver requisitos aprovados, lança erro tratável.
 *  - A7:    em caso de falha durante a geração, propaga erro tratável.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchProjetoCompleto } from './api';
import type { ProjetoCompleto, Requisito } from './types';

export class SemRequisitosAprovadosError extends Error {
  constructor() {
    super(
      'Não é possível gerar o documento, pois não há requisitos validados pelo cliente neste projeto.'
    );
    this.name = 'SemRequisitosAprovadosError';
  }
}

export class FalhaExportacaoError extends Error {
  constructor(causa?: unknown) {
    super('Erro ao gerar o arquivo. Tente novamente em alguns instantes.');
    this.name = 'FalhaExportacaoError';
    if (causa instanceof Error && causa.stack) this.stack = causa.stack;
  }
}

interface DadosDocumento {
  projeto: ProjetoCompleto;
  aprovados: Requisito[];
}

async function carregarDadosParaExportacao(idProjeto: string): Promise<DadosDocumento> {
  const projeto = await fetchProjetoCompleto(idProjeto);
  if (!projeto) {
    throw new FalhaExportacaoError(new Error('Projeto não encontrado.'));
  }

  const aprovados = (projeto.requisitos || []).filter(
    (r) => r.status_validacao === 'Aprovado'
  );

  if (aprovados.length === 0) {
    // A6 — Ausência de Requisitos Aprovados
    throw new SemRequisitosAprovadosError();
  }

  return { projeto, aprovados };
}

function sanitizarNomeArquivo(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

/**
 * Gera e dispara o download do PDF de documentação do projeto.
 * Retorna o nome do arquivo gerado.
 */
export async function gerarDocumentacaoPdf(idProjeto: string): Promise<string> {
  let dados: DadosDocumento;

  try {
    dados = await carregarDadosParaExportacao(idProjeto);
  } catch (err) {
    if (err instanceof SemRequisitosAprovadosError) throw err;
    throw new FalhaExportacaoError(err);
  }

  try {
    const { projeto, aprovados } = dados;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let cursorY = margin;

    // Cabeçalho
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Documento de Requisitos Aprovados', margin, cursorY);
    cursorY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Gerado pelo ScopeMaster', margin, cursorY);
    cursorY += 10;

    // Linha divisória
    doc.setDrawColor(200);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 8;

    // Identificação do projeto
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Identificação do Projeto', margin, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const dataCriacao = new Date(projeto.data_criacao).toLocaleDateString('pt-BR');
    const dataExportacao = new Date().toLocaleString('pt-BR');

    const linhasIdent = [
      `Projeto: ${projeto.nome}`,
      `Descrição: ${projeto.descricao || '—'}`,
      `Data de criação: ${dataCriacao}`,
      `Documento gerado em: ${dataExportacao}`,
      `Total de requisitos aprovados: ${aprovados.length}`,
    ];
    linhasIdent.forEach((linha) => {
      const wrapped = doc.splitTextToSize(linha, pageWidth - margin * 2);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 5;
    });

    cursorY += 4;

    // Tabela de requisitos aprovados
    autoTable(doc, {
      startY: cursorY,
      head: [['Código', 'Tipo', 'Descrição']],
      body: aprovados.map((r) => [r.codigo, r.tipo, r.descricao]),
      styles: { fontSize: 10, cellPadding: 3, valign: 'top' },
      headStyles: { fillColor: [33, 33, 33], textColor: 255, halign: 'left' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 32 },
        2: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    // Rodapé com numeração de páginas
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Página ${i} de ${totalPaginas} — ScopeMaster`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }

    const nomeArquivo = `Requisitos_${sanitizarNomeArquivo(projeto.nome)}_${Date.now()}.pdf`;
    doc.save(nomeArquivo);
    return nomeArquivo;
  } catch (err) {
    // A7 — Falha na Exportação
    console.error('gerarDocumentacaoPdf error:', err);
    throw new FalhaExportacaoError(err);
  }
}
