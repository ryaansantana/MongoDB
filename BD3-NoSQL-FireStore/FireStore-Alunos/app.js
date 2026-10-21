import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

//(Console do Firebase > Configurações do projeto > Seus aplicativos > App da Web > SDK setup and configuration)
const firebaseConfig = {
  apiKey: "AIzaSyAR_jkrfr_pc8Oo1bVLe-ofPdcKgstEDSU",
  authDomain: "app-bd3-ryan.firebaseapp.com",
  projectId: "app-bd3-ryan",
  storageBucket: "app-bd3-ryan.firebasestorage.app",
  messagingSenderId: "783096329824",
  appId: "1:783096329824:web:1fe0b8ed2c7994f8ee3505",
  measurementId: "G-32SLCSPD4N"
};

const NOME_COLECAO = "BD3-NoSQL-Firestore";

//a) Conecta com o projeto do Firebase
const app = initializeApp(firebaseConfig);
//b) Conecta com o Firestore e com a coleção
const db = getFirestore(app);
const colecao = collection(db, NOME_COLECAO);

const form = document.getElementById("form-aluno");
const lista = document.getElementById("lista");
const vazio = document.getElementById("vazio");
const statusEl = document.getElementById("status");
const btnListar = document.getElementById("btn-listar");

function setStatus(texto, tipo = "") {
  statusEl.textContent = texto;
  statusEl.className = "status " + tipo;
}

function formatarData(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") return "-";
  //Mostra em UTC para não "voltar um dia" por causa do fuso horário
  return timestamp.toDate().toLocaleDateString("pt-BR");
}

//c) Inserir um registro de aluno
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;

  try {
    //BÔNUS: converte a data do input (YYYY-MM-DD) para Timestamp do Firestore.
    //Usamos meia-noite UTC para a data ficar fiel ao que foi digitada.
    const dataStr = document.getElementById("data_nascimento").value;
    const dataNascimento = Timestamp.fromDate(new Date(dataStr + "T00:00:00"));

    const aluno = {
      nome: document.getElementById("nome").value.trim(),
      cpf: document.getElementById("cpf").value.trim(),
      rg: document.getElementById("rg").value.trim(),
      telefone_aluno: document.getElementById("telefone_aluno").value.trim(),
      telefone_responsavel: document.getElementById("telefone_responsavel").value.trim(),
      email: document.getElementById("email").value.trim(),
      data_nascimento: dataNascimento,
    };

    await addDoc(colecao, aluno);
    form.reset();
    setStatus("Aluno salvo com sucesso!", "ok");
    await listarAlunos();
  } catch (erro) {
    console.error(erro);
    setStatus("Erro ao salvar: " + erro.message, "erro");
  } finally {
    btn.disabled = false;
  }
});

//d) Listar todos os registros de aluno
async function listarAlunos() {
  try {
    const q = query(colecao, orderBy("nome"));
    const snapshot = await getDocs(q);

    lista.innerHTML = "";
    vazio.hidden = !snapshot.empty;

    snapshot.forEach((documento) => {
      const a = documento.data();
      const tr = document.createElement("tr");

      [
        a.nome,
        a.cpf,
        a.rg,
        a.telefone_aluno,
        a.telefone_responsavel,
        a.email,
        formatarData(a.data_nascimento),
      ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor ?? "-";
        tr.appendChild(td);
      });

      //e) Excluir um registro de aluno
      const tdAcao = document.createElement("td");
      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.className = "danger";
      btnExcluir.addEventListener("click", () => excluirAluno(documento.id, a.nome));
      tdAcao.appendChild(btnExcluir);
      tr.appendChild(tdAcao);

      lista.appendChild(tr);
    });

    setStatus(`Conectado ao Firestore · ${snapshot.size} aluno(s)`, "ok");
  } catch (erro) {
    console.error(erro);
    setStatus("Erro ao listar: " + erro.message, "erro");
  }
}

//e) Excluir um registro de aluno
async function excluirAluno(id, nome) {
  if (!confirm(`Excluir o aluno "${nome}"?`)) return;
  try {
    await deleteDoc(doc(db, NOME_COLECAO, id));
    setStatus("Aluno excluído.", "ok");
    await listarAlunos();
  } catch (erro) {
    console.error(erro);
    setStatus("Erro ao excluir: " + erro.message, "erro");
  }
}

btnListar.addEventListener("click", listarAlunos);
listarAlunos();
