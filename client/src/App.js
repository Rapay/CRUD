import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    nome: '',
    matricula: '',
    email: '',
    curso: '',
    dataNascimento: '',
    telefone: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  const cursos = [
    'Ciência da Computação',
    'Engenharia de Software',
    'Sistemas de Informação',
    'Análise e Desenvolvimento de Sistemas',
    'Redes de Computadores'
  ];

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleOpen = (student = null) => {
    if (student) {
      // Format date for input field
      const formattedStudent = {
        ...student,
        dataNascimento: student.dataNascimento ? new Date(student.dataNascimento).toISOString().split('T')[0] : ''
      };
      setCurrentStudent(formattedStudent);
      setIsEditing(true);
    } else {
      setCurrentStudent({
        nome: '',
        matricula: '',
        email: '',
        curso: '',
        dataNascimento: '',
        telefone: '',
        endereco: {
          rua: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: ''
        }
      });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentStudent({
      nome: '',
      matricula: '',
      email: '',
      curso: '',
      dataNascimento: '',
      telefone: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      }
    });
    setIsEditing(false);
    setShowAddress(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/students/${currentStudent._id}`, currentStudent);
      } else {
        await axios.post(`${API_URL}/students`, currentStudent);
      }
      fetchStudents();
      handleClose();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/students/${id}`);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCurrentStudent({
        ...currentStudent,
        [parent]: {
          ...currentStudent[parent],
          [child]: value
        }
      });
    } else {
      setCurrentStudent({
        ...currentStudent,
        [name]: value
      });
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistema de Gerenciamento de Alunos
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
          sx={{ mb: 2 }}
        >
          Adicionar Novo Aluno
        </Button>

        <List>
          {students.map((student) => (
            <ListItem key={student._id} divider>
              <ListItemText
                primary={student.nome}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Matrícula: {student.matricula} | Curso: {student.curso}
                    </Typography>
                    <br />
                    Email: {student.email}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleOpen(student)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(student._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {isEditing ? 'Editar Aluno' : 'Adicionar Novo Aluno'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Nome"
                  name="nome"
                  fullWidth
                  value={currentStudent.nome}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Matrícula"
                  name="matricula"
                  fullWidth
                  value={currentStudent.matricula}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  value={currentStudent.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Curso</InputLabel>
                  <Select
                    name="curso"
                    value={currentStudent.curso}
                    onChange={handleChange}
                    label="Curso"
                    required
                  >
                    {cursos.map((curso) => (
                      <MenuItem key={curso} value={curso}>
                        {curso}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Data de Nascimento"
                  name="dataNascimento"
                  type="date"
                  fullWidth
                  value={currentStudent.dataNascimento}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Telefone"
                  name="telefone"
                  fullWidth
                  value={currentStudent.telefone}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowAddress(!showAddress)}
                  sx={{ mt: 1 }}
                >
                  {showAddress ? 'Ocultar Endereço' : 'Mostrar Endereço'}
                </Button>
              </Grid>
              
              {showAddress && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Endereço
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      margin="dense"
                      label="Rua"
                      name="endereco.rua"
                      fullWidth
                      value={currentStudent.endereco.rua}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      margin="dense"
                      label="Número"
                      name="endereco.numero"
                      fullWidth
                      value={currentStudent.endereco.numero}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="dense"
                      label="Bairro"
                      name="endereco.bairro"
                      fullWidth
                      value={currentStudent.endereco.bairro}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="dense"
                      label="Cidade"
                      name="endereco.cidade"
                      fullWidth
                      value={currentStudent.endereco.cidade}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Estado</InputLabel>
                      <Select
                        name="endereco.estado"
                        value={currentStudent.endereco.estado}
                        onChange={handleChange}
                        label="Estado"
                      >
                        {estados.map((estado) => (
                          <MenuItem key={estado} value={estado}>
                            {estado}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="dense"
                      label="CEP"
                      name="endereco.cep"
                      fullWidth
                      value={currentStudent.endereco.cep}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSubmit} color="primary">
              {isEditing ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default App; 