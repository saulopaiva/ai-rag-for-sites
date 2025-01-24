// Node imports
import readline from 'node:readline';
import chalk from 'chalk';
import fs from "node:fs";
import { parse, transform, stringify } from 'csv';


// Custom imports
import crawler from './crawler.js';
import assistant from './assistant.js';
import assistantValidation from './assistant-validation.js';
import turnPageIntoVector from './vector-store/page-handling.js';


// Initialize basic environment variables
const baseUrl = process.env.SITE_BASE_URL;
const initialPage = process.env.SITE_INITIAL_PAGE;
const allowedPagesToVisit = process.env.SITE_ALLOWED_PAGES !== '' ? process.env.SITE_ALLOWED_PAGES.split(',').map(i => i.trim()) : null;
const maxCrawlLength = process.env.MAX_CRAWL_NUM_PAGES || 10;
const maxConcurrency = process.env.MAX_CONCURRENT_REQUESTS || 2;


// ############################
// CRAWLER
await crawler({
  baseUrl,
  initialPage,
  allowedPagesToVisit,
  maxCrawlLength,
  maxConcurrency,
  dataHandler: turnPageIntoVector
});


const stringToCsv = (string) => {
  return '"' + string.replace(/"/g, '\'').replace(/,/g, '\,') + '"'
}



const validationUserInput = `avalie este input e output com base nos criterios definidos. Responda no formato: Relevancia: X, Precisao: Y, Clareza: Z ----\n`;

const validationInputSpecific = `\nConsidere essas informações a respeito do pacote para avaliar:
ARRAIAL DO CABO+RIO DE JANEIRO CENTRO
17 abr
4 dias
A partir de R$ 1.165,89

Temos uma proposta imperdível para o feriado prolongado, Que tal aproveitar esses 4 dias para uma combinação perfeita de diversão na cidade maravilhosa e tranquilidade nas deslumbrantes praias do litoral da região dos lagos ?

Sim, eu estou falando de Rio de Janeiro e Arraial do Cabo, estes dois roteiros imperdível juntos para que vc possa aproveitar e muito !!!

 Embarque
1º Local: Metrô Santo Amaro
17/04/25 às 20:00
2º Local: Poupa Tempo Pirajussara
17/04/25 às 21:00
3º Local: Taboao Da Serra - Centro
17/04/25 às 21:30
4º Local: Metrô São Paulo-Morumbi
17/04/25 às 22:00
5º Local: Memorial Da America Latina Portao 7
17/04/25 às 23:00
  Retorno
Local: Todos os desembarques acontecerão nos mesmos locais de embarques
21/04/25 às 22:00
Roteiro
ROTEIRO

18/04/2025 Sexta-feira

08:00hs- Previsão de Chegada em Arraial do Cabo
Dia Livre
Desembarque no estacionamento (jardineira 20,00 não incluso)
Sugestões:
Passeio de escuna - 4 horas de duração, parada para mergulho, música, frutas (120,00 por pessoa opcional, não incluso)
Passeio de Buggy- Parada nas praias para fotos e curtir praia (100,00 por pessoal opcional, não incluso)
17:00 Ponto de encontro para pegar a jardineira e ir para o estacionamento
17:30 Ida para hospedagem Rio Centro
Noite livre
19/04/2025-Sábado

06:00 às 10:00hs Café da manhã
09:00 - Praia do Arpoador
18:00 - Retorno para o Hotel
21:00 - Evento de Samba Tia Doca ou Lapa (entradas não inclusas)
20/04/2025-Domingo

06:00 às 10:00hs Café da manhã
09:00 - Praia da Urca
15:00 - Retorno para o Hotel
17:00 - Ida para o Cacique de Ramos
20/04/2025-Segunda-feira

06:00 às 10:00hs Café da manhã
Manhã livre
12:00 - Check-out
City tour Lapa-Almoço
15:00 - Ida para o Renascença (entrada não inclusa)
22:00- Retorno para São Paulo


Formas de pagamento
Pague com cartão em até 12x ou via Pix. Compra protegida por criptografia, garantindo segurança total.

VisaMastercardEloHipercardAmerican ExpressPix
Site seguro Google Site seguro Google
Pacotes (VALORES POR PESSOA)
Suíte para 5 pessoas (1 cama de casal +3 solteiro )
AdultoR$ 1165,89
Crianças (crianças de 6 a 10 anos )R$ 1059,89
Crianças (crianças de 3 até 5 anos viaja no colo, acompanhada de dois adultos pagantes)R$ 317,89
Crianças (crianças de 3 até 5 anos viaja na poltrona, acompanhada de dois adultos pagantes)R$ 529,89
Suíte para 4 pessoas (1 cama de casal+2 solteiro )Somente: 4 vagas
AdultoR$ 1165,89
Crianças (crianças de 6 a 10 anos )R$ 1059,89
Crianças (crianças de 3 até 5 anos viaja no colo , acompanhada de dois adultos pagantes)R$ 317,89
Crianças (crianças de 3 até 5 anos viaja na poltrona,acompanhada de dois adultos pagantes)R$ 529,89
Suíte para 3 pessoas Somente: 3 vagas
AdultoR$ 1271,89
Crianças (crianças de 6 a 10 anos )R$ 1059,89
Crianças (crianças de 3 até 5 anos viaja na poltrona, acompanhada de dois adultos pagantes)R$ 529,89
Crianças (crianças de 3 até 5 anos viaja no colo )R$ 317,89
Suíte para casal ( 2 camas de solteiro ou 1 camas de casal)Somente: 3 vagas
AdultoR$ 1324,89
Crianças (criança de 6 a 10 anos )R$ 1324,89
Crianças (crianças de 3 até 5 anos viaja na poltrona, acompanhada de 2 adultos pagantes)R$ 529,89
Crianças (crianças de 3 até 5 anos viaja no colo, acompanhada de 2 adultos pagantes)R$ 317,89
O que está incluso
Nosso pacote inclui:

Ônibus Semi leito DD, água cortesia e wi fi
Hospedagem em hotel no Rio
3 cafés da manhã;
Traslado para Arraial do Cabo
Traslado para praia de Arpoardor e Urca
Traslado para Cacique de Ramos
Traslado para Renascença Clube
City tour
Evento de samba
Sorteio de brindes
Tia e tio da excursão interagindo com a galera ;


O que não está incluso
Jardineira 20,00 não incluso

Passeio de escuna opcional

Passeio de Buggy opcional

Entrada nos eventos de samba opcional

Alimentação não citada nos itens inclusos



Termo de responsabilidade
Para embarque é obrigatório apresentar documento oficial com foto:

Registro Geral (RG) Original; ou

Carteira de Habilitação (CNH) Original; ou

Passaporte Original.

No caso de menores de idade até 16 anos para viagens interestaduais é obrigatório:

Levar certidão de nascimento original ou documento de identidade;

Estar acompanhado com responsável maior de 18 anos, munido de autorização preenchida pelo responsável e reconhecida;

Levar documento original ou cópia autenticada do responsável pela assinatura da autorização;A

O viajante que não portar nenhum destes documentos estará impossibilitado de continuar na viagem. Neste caso o cancelamento é de total responsabilidade do contratante.

__________________________________________________________________________________________________

Politica de cancelamento e/ou desistência

A desistência da viagem pelo participante poderá ser efetuada com a transferência da vaga para outro participante de sua indicação sem custos até três dias antes da viagem, caso contrário, arcará com os valores especificados abaixo de acordo com deliberação normativa n° 161 de 9 de agosto de 1885 da Embratur:

Antecedência acima de 30 dias da data da viagem reembolso de 90% do valor do passeio;

Antecedência de 20 a 29 dias da data da viagem reembolso de 70% do valor do passeio;

Antecedência de 15 a 19 dias da data da viagem reembolso de 50% do valor do passeio;

Cancelamento com prazo abaixo de 15 dias o reembolso varia de 15 a 0 % do valor do passeio.

Caso o passeio seja cancelado pela CONTRATADA:

Se for de interesse das partes o valor pago pode ficar como crédito a ser usado em outra viagem;

A mesma se compromete a devolver integralmente o valor do pagamento pelo CONTRATANTE.

__________________________________________________________________________________________________

Especificidades deste pacote de viagem

Por trata-se de um roteiro que é previamente agendado com prazos acima de 120 dias, os pagamentos dos serviços contratados como hotel , transfers,ingressos, etc... São sinalizados pela contrada com tamanha antecipação para garantia da prestação de serviços. Valores repassados para estes fins não serão ressarcidos, assim como valores repassados para a contratada, dando o direito a contratante de colocar outro pessoa no lugar em caso de cancelamento.

__________________________________________________________________________________________________

Politica de mínimo participante

Mínimo de 14 passageiros: Van executiva;

Mínimo de 23 passageiros: micro-ônibus executivo;

Mínimo de 40 passageiros: ônibus executivo;

O preenchimento de mais de um veículo seguirá a distribuição por carros seguindo ordem de confirmação ou conforme combinado;

Caso não atinja o numero mínimo, será feito a devolução total de valores pagos conforme for combinado entre a organização e os participante.

__________________________________________________________________________________________________

Autorização para uso de imagem

O contratante autoriza o sua imagem, video e voz pela agencia Parceirustur para fim de divulgação, depoimento e/ou propaganda;

O mesmo reconhece que o uso da imagem, voz e/ou depoimento poderá ser feito nas redes sociais , banners, flyers de divulgações e sites totalmente voltados para o fim que se destina de dilvulgação do trabalho da agencia;

Na presente autorização o contratante reconhece que o uso da sua imagem é concedido a titulo gratuíto.
`;


const questions = JSON.parse(fs.readFileSync(`${process.cwd()}/data/questions.json`, 'utf-8'))
const csvFile = `${process.cwd()}/data/questions.csv`;
let fileString = 'Identifier,Question,Type,Response,Relevance,Accuracy,Clarity,Final-Assessment,Observations';


function forEachPromise(items, fn) {
  return items.reduce(function (promise, item) {
    return promise.then(function () {
      return fn(item);
    });
  }, Promise.resolve());
}


function emitQuestion(question) {
  return new Promise((resolve, reject) => {
    console.log(chalk.green(`\nEnviando questão: ${question.id}`));

    process.nextTick(async () => {
      let questionResult = await assistant.invoke({
        input: question.question,
      });

      console.log(chalk.green(`Avaliando questão: ${question.id}`));

      let validationUserInputSpecific = validationUserInput + (question.type == 'Específico' ? validationInputSpecific : '');

      let questionEvaluationResult = await assistantValidation.invoke({
        input: validationUserInputSpecific + "{input: " + question.question + ", output: " + questionResult.output + "}",
      });

      if (questionResult && questionResult.input && questionResult.output) {
        console.log(chalk.yellow(`\nQuestion: ${questionResult.input}`));
        console.log(chalk.blue(`Answer: ${questionResult.output}`));

        const jsonObject = {
          Identifier: question.id,
          Question: stringToCsv(question.question),
          Type: question.type,
          Expectation: '',
          Response: stringToCsv(questionResult.output),
          Relevance: 'x',
          Accuracy: 'y',
          Clarity: 'z',
          'Final-Assessment': 'K',
          Observations: stringToCsv(questionEvaluationResult.output),
        };

        fileString += '\n' +  Object.values(jsonObject).join(',')
      }

      resolve();
    })
  });
}

forEachPromise(questions, emitQuestion).then(() => {
  console.log('done');
  fs.writeFileSync(csvFile, fileString, 'utf8');
});




