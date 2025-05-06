const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve os arquivos estáticos do React
app.use(express.static(path.join(__dirname, 'client/build')));

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aluno-crud', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schema do Aluno
const studentSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  matricula: { type: String, required: true, unique: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} não é um e-mail válido!`
    }
  },
  curso: { type: String, required: true },
  dataNascimento: { type: Date },
  telefone: { type: String },
  endereco: {
    rua: String,
    numero: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// Rotas

// Criar novo aluno
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Listar todos os alunos com paginação
app.get('/api/students', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const students = await Student.find()
      .skip(skip)
      .limit(limit);
    
    const total = await Student.countDocuments();

    res.json({
      students,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalStudents: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buscar um aluno por ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Aluno não encontrado' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Atualizar um aluno
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStudent) return res.status(404).json({ message: 'Aluno não encontrado' });
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deletar um aluno
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: 'Aluno não encontrado' });
    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Busca avançada de alunos
app.get('/api/students/search/advanced', async (req, res) => {
  try {
    const { nome, curso, cidade, estado, idade } = req.query;
    let searchQuery = {};
    
    if (nome) {
      searchQuery.nome = { $regex: nome, $options: 'i' };
    }
    if (curso) {
      searchQuery.curso = { $regex: curso, $options: 'i' };
    }
    if (cidade) {
      searchQuery['endereco.cidade'] = { $regex: cidade, $options: 'i' };
    }
    if (estado) {
      searchQuery['endereco.estado'] = { $regex: estado, $options: 'i' };
    }
    if (idade) {
      const today = new Date();
      const yearAgo = new Date(today.getFullYear() - idade, today.getMonth(), today.getDate());
      searchQuery.dataNascimento = { $lte: yearAgo };
    }

    const students = await Student.find(searchQuery);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Estatísticas dos alunos
app.get('/api/students/stats/summary', async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalAlunos: { $sum: 1 },
          cursos: { $addToSet: '$curso' },
          idadeMedia: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), '$dataNascimento'] },
                365 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalAlunos: 1,
          numeroCursos: { $size: '$cursos' },
          idadeMedia: { $round: ['$idadeMedia', 1] }
        }
      }
    ]);

    res.json(stats[0] || { 
      totalAlunos: 0, 
      numeroCursos: 0, 
      idadeMedia: 0 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deletar múltiplos alunos
app.post('/api/students/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Requisição inválida: array de IDs é necessário' });
    }

    const result = await Student.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: `${result.deletedCount} alunos foram deletados com sucesso`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota catch-all para servir o app React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});