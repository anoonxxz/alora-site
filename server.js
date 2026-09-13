require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function validarCurriculo({ nome, email, telefone, qualificacoes, experiencias, arquivo_url }) {
  if (!nome || !email) {
    return 'Nome e e-mail são obrigatórios.';
  }
  if (!arquivo_url && (!telefone || !qualificacoes || !experiencias)) {
    return 'Sem arquivo anexado, todos os campos são obrigatórios.';
  }
  return null;
}

app.post('/api/curriculos', async (req, res) => {
  const erroValidacao = validarCurriculo(req.body);
  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }

  const { error } = await supabase.from('curriculos').insert(req.body);

  if (error) {
    return res.status(500).json({ erro: 'Erro ao salvar no banco.' });
  }

  res.status(201).json({ mensagem: 'Currículo cadastrado com sucesso!' });
});

app.get('/api/curriculos', async (req, res) => {
  const termo = req.query.busca;

  let query = supabase.from('curriculos').select('*');

  if (termo) {
    query = query.or(`nome.ilike.%${termo}%,email.ilike.%${termo}%,qualificacoes.ilike.%${termo}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ erro: 'Erro ao buscar currículos.' });
  }

  res.json(data);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor Alora rodando na porta ${PORT}`));