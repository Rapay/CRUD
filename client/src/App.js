import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Nav,
  Card,
  Alert
} from 'react-bootstrap';

function App() {
  const [activeTab, setActiveTab] = useState('alunos');
  const [alunos, setAlunos] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [message, setMessage] = useState('');
  const [formAluno, setFormAluno] = useState({
    nome: '',
    email: '',
    statusAprovacao: false
  });
  const [formTutor, setFormTutor] = useState({
    nome: '',
    especialidade: ''
  });
  const [formAula, setFormAula] = useState({
    data: '',
    tipo: 'TEORICA',
    alunoId: '',
    tutorId: '',
  });
  const [editing, setEditing] = useState(null);

  // Buscar dados
  useEffect(() => {
    fetchAlunos();
    fetchTutores();
    fetchAulas();
  }, []);

  const fetchAlunos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/alunos');
      setAlunos(response.data);
    } catch (error) {
      setMessage('Erro ao carregar alunos: ' + error.message);
    }
  };

  const fetchTutores = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tutores');
      setTutores(response.data);
    } catch (error) {
      setMessage('Erro ao carregar tutores: ' + error.message);
    }
  };

  const fetchAulas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/aulas');
      setAulas(response.data);
    } catch (error) {
      setMessage('Erro ao carregar aulas: ' + error.message);
    }
  };

  // Funções para Alunos
  const handleSubmitAluno = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/alunos/${editing}`, formAluno);
      } else {
        await axios.post('http://localhost:5000/api/alunos', formAluno);
      }
      setFormAluno({ nome: '', email: '', statusAprovacao: false });
      setEditing(null);
      fetchAlunos();
      setMessage('Aluno ' + (editing ? 'atualizado' : 'cadastrado') + ' com sucesso!');
    } catch (error) {
      setMessage('Erro ao ' + (editing ? 'atualizar' : 'cadastrar') + ' aluno: ' + error.message);
    }
  };

  const deleteAluno = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      try {
        await axios.delete(`http://localhost:5000/api/alunos/${id}`);
        fetchAlunos();
        setMessage('Aluno excluído com sucesso!');
      } catch (error) {
        setMessage('Erro ao excluir aluno: ' + error.message);
      }
    }
  };

  // Funções para Tutores
  const handleSubmitTutor = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/tutores/${editing}`, formTutor);
      } else {
        await axios.post('http://localhost:5000/api/tutores', formTutor);
      }
      setFormTutor({ nome: '', especialidade: '' });
      setEditing(null);
      fetchTutores();
      setMessage('Tutor ' + (editing ? 'atualizado' : 'cadastrado') + ' com sucesso!');
    } catch (error) {
      setMessage('Erro ao ' + (editing ? 'atualizar' : 'cadastrar') + ' tutor: ' + error.message);
    }
  };

  const deleteTutor = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este tutor?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tutores/${id}`);
        fetchTutores();
        setMessage('Tutor excluído com sucesso!');
      } catch (error) {
        setMessage('Erro ao excluir tutor: ' + error.message);
      }
    }
  };

  // Função para agendar aula
  const handleSubmitAula = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/alunos/${formAula.alunoId}/agendar-aula`, {
        data: formAula.data,
        tipo: formAula.tipo,
        tutorId: formAula.tutorId
      });
      setFormAula({ data: '', tipo: 'TEORICA', alunoId: '', tutorId: '' });
      fetchAulas();
      setMessage('Aula agendada com sucesso!');
    } catch (error) {
      setMessage('Erro ao agendar aula: ' + error.message);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Sistema de Gestão de Auto Escola</h1>
      
      {message && (
        <Alert variant={message.includes('Erro') ? 'danger' : 'success'} onClose={() => setMessage('')} dismissible>
          {message}
        </Alert>
      )}

      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'alunos'} 
            onClick={() => setActiveTab('alunos')}
          >
            Alunos
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'tutores'} 
            onClick={() => setActiveTab('tutores')}
          >
            Tutores
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'aulas'} 
            onClick={() => setActiveTab('aulas')}
          >
            Aulas
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'alunos' ? (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{editing ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}</Card.Title>
              <Form onSubmit={handleSubmitAluno}>
                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control
                        type="text"
                        value={formAluno.nome}
                        onChange={(e) => setFormAluno({...formAluno, nome: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={formAluno.email}
                        onChange={(e) => setFormAluno({...formAluno, email: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Check
                        type="checkbox"
                        label="Aprovado"
                        checked={formAluno.statusAprovacao}
                        onChange={(e) => setFormAluno({...formAluno, statusAprovacao: e.target.checked})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" variant="primary">
                  {editing ? 'Atualizar' : 'Cadastrar'}
                </Button>
                {editing && (
                  <Button variant="secondary" className="ms-2" onClick={() => {
                    setEditing(null);
                    setFormAluno({ nome: '', email: '', statusAprovacao: false });
                  }}>
                    Cancelar
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map(aluno => (
                <tr key={aluno.id}>
                  <td>{aluno.id}</td>
                  <td>{aluno.nome}</td>
                  <td>{aluno.email}</td>
                  <td>{aluno.statusAprovacao ? 'Aprovado' : 'Pendente'}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setFormAluno(aluno);
                        setEditing(aluno.id);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteAluno(aluno.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : activeTab === 'tutores' ? (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{editing ? 'Editar Tutor' : 'Cadastrar Novo Tutor'}</Card.Title>
              <Form onSubmit={handleSubmitTutor}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control
                        type="text"
                        value={formTutor.nome}
                        onChange={(e) => setFormTutor({...formTutor, nome: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Especialidade</Form.Label>
                      <Form.Control
                        type="text"
                        value={formTutor.especialidade}
                        onChange={(e) => setFormTutor({...formTutor, especialidade: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" variant="primary">
                  {editing ? 'Atualizar' : 'Cadastrar'}
                </Button>
                {editing && (
                  <Button variant="secondary" className="ms-2" onClick={() => {
                    setEditing(null);
                    setFormTutor({ nome: '', especialidade: '' });
                  }}>
                    Cancelar
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Especialidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tutores.map(tutor => (
                <tr key={tutor.id}>
                  <td>{tutor.id}</td>
                  <td>{tutor.nome}</td>
                  <td>{tutor.especialidade}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setFormTutor(tutor);
                        setEditing(tutor.id);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteTutor(tutor.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Agendar Nova Aula</Card.Title>
              <Form onSubmit={handleSubmitAula}>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Aluno</Form.Label>
                      <Form.Select
                        value={formAula.alunoId}
                        onChange={(e) => setFormAula({...formAula, alunoId: e.target.value})}
                        required
                      >
                        <option value="">Selecione um aluno...</option>
                        {alunos.map(aluno => (
                          <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tutor</Form.Label>
                      <Form.Select
                        value={formAula.tutorId}
                        onChange={(e) => setFormAula({...formAula, tutorId: e.target.value})}
                        required
                      >
                        <option value="">Selecione um tutor...</option>
                        {tutores.map(tutor => (
                          <option key={tutor.id} value={tutor.id}>{tutor.nome}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Data e Hora</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={formAula.data}
                        onChange={(e) => setFormAula({...formAula, data: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo</Form.Label>
                      <Form.Select
                        value={formAula.tipo}
                        onChange={(e) => setFormAula({...formAula, tipo: e.target.value})}
                        required
                      >
                        <option value="TEORICA">Teórica</option>
                        <option value="PRATICA">Prática</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" variant="primary">
                  Agendar Aula
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Aluno</th>
                <th>Tutor</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {aulas.map(aula => (
                <tr key={aula.id}>
                  <td>{aula.id}</td>
                  <td>{aula.Aluno?.nome}</td>
                  <td>{aula.Tutor?.nome}</td>
                  <td>{new Date(aula.data).toLocaleString()}</td>
                  <td>{aula.tipo}</td>
                  <td>{aula.status}</td>
                  <td>
                    {aula.status === 'AGENDADA' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={async () => {
                            try {
                              await axios.post(`http://localhost:5000/api/tutores/aulas/${aula.id}/validar`, {
                                status: 'CONCLUIDA'
                              });
                              fetchAulas();
                              setMessage('Aula concluída com sucesso!');
                            } catch (error) {
                              setMessage('Erro ao concluir aula: ' + error.message);
                            }
                          }}
                        >
                          Concluir
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={async () => {
                            try {
                              await axios.post(`http://localhost:5000/api/tutores/aulas/${aula.id}/validar`, {
                                status: 'CANCELADA'
                              });
                              fetchAulas();
                              setMessage('Aula cancelada com sucesso!');
                            } catch (error) {
                              setMessage('Erro ao cancelar aula: ' + error.message);
                            }
                          }}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
}

export default App;