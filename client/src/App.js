import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Container,
  Table,
  Button,
  Form,
  Nav,
  Card,
  Alert
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  // Estados
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('login');
  const [tutores, setTutores] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [registerForm, setRegisterForm] = useState({ 
    nome: '', 
    email: '', 
    senha: '', 
    telefone: '', 
    endereco: '',
    dataNascimento: null 
  });
  const [aulaForm, setAulaForm] = useState({
    data: new Date(),
    tipo: 'TEORICA',
    tutorId: ''
  });

  // Configuração do Axios
  axios.defaults.baseURL = API_URL;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Configurar interceptador para lidar com erros de autenticação
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Token expirado ou inválido, faça logout
        setToken(null);
        localStorage.removeItem('token');
        setActiveTab('login');
        setError('Sessão expirada. Por favor, faça login novamente.');
      }
      return Promise.reject(error);
    }
  );

  // Efeitos
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Funções auxiliares
  const fetchData = async () => {
    try {
      const [tutoresRes, aulasRes] = await Promise.all([
        axios.get('/tutores'),
        axios.get('/aulas')
      ]);

      setTutores(tutoresRes.data);
      setAulas(aulasRes.data);
    } catch (err) {
      setError('Erro ao carregar dados');
    }
  };
  // Estados para erros de campos específicos
  const [fieldErrors, setFieldErrors] = useState({ email: '', senha: '' });
  
  // Estados para erros nos campos de registro
  const [registerFieldErrors, setRegisterFieldErrors] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    endereco: '',
    dataNascimento: ''
  });

  // Handlers de autenticação
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Limpar erros anteriores
      setError('');
      setFieldErrors({ email: '', senha: '' });

      const res = await axios.post('/alunos/login', loginForm);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setActiveTab('aulas');
      console.log('Login bem sucedido:', res.data);
    } catch (err) {
      console.error('Erro no login:', err);
      
      // Verifica se há informações específicas sobre o campo com erro
      if (err.response?.data) {
        const { mensagem, campo, erro } = err.response.data;
        
        // Exibe o erro geral
        setError(mensagem || 'Erro no login. Verifique suas credenciais.');
        
        // Se o erro está associado a um campo específico, exibe-o no campo correspondente
        if (campo) {
          setFieldErrors(prev => ({ ...prev, [campo]: erro }));
        }
      } else {
        setError('Erro ao conectar com o servidor. Tente novamente.');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Limpar erros anteriores
      setError('');
      setRegisterFieldErrors({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        endereco: '',
        dataNascimento: ''
      });

      const response = await axios.post('/alunos/register', registerForm);
      
      // Verifica se o servidor retornou um token
      if (response.data.token) {
        // Login automático após registro
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setActiveTab('aulas');
        setMessage('Registro realizado com sucesso! Você está logado automaticamente.');
      } else {
        // Caso contrário, mostra mensagem e redireciona para login
        setMessage('Registro realizado com sucesso! Por favor, faça login.');
        setActiveTab('login');
      }
      
      setRegisterForm({ 
        nome: '', 
        email: '', 
        senha: '', 
        telefone: '', 
        endereco: '',
        dataNascimento: null 
      });
      setError('');
    } catch (err) {
      console.error('Erro no registro:', err);
      
      // Verifica se há informações específicas sobre o campo com erro
      if (err.response?.data) {
        const { mensagem, campo, erro } = err.response.data;
        
        // Exibe o erro geral
        setError(mensagem || 'Erro no registro. Tente novamente.');
        
        // Se o erro está associado a um campo específico, exibe-o no campo correspondente
        if (campo) {
          setRegisterFieldErrors(prev => ({ ...prev, [campo]: erro }));
        }
      } else {
        setError('Erro ao conectar com o servidor. Tente novamente.');
      }
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setActiveTab('login');
  };

  // Handler de agendamento
  const handleAgendarAula = async (e) => {
    e.preventDefault();
    try {
      // O middleware de autenticação já vai identificar o aluno pelo token
      await axios.post('/aulas', aulaForm);
      setMessage('Aula agendada com sucesso!');
      setAulaForm({
        data: new Date(),
        tipo: 'TEORICA',
        tutorId: ''
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao agendar aula');
    }
  };
  
  const handleCancelarAula = async (aulaId) => {
    try {
      await axios.delete(`/aulas/${aulaId}`);
      setMessage('Aula cancelada com sucesso!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cancelar aula');
    }
  };

  // Renderização condicional de formulários
  const renderLoginForm = () => (
    <Form onSubmit={handleLogin}>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="seu@email.com"
          value={loginForm.email}
          onChange={e => {
            setLoginForm({...loginForm, email: e.target.value});
            // Limpa mensagem de erro quando o usuário começa a digitar
            if (fieldErrors.email) setFieldErrors(prev => ({...prev, email: ''}));
          }}
          required
          autoFocus
          isInvalid={!!fieldErrors.email}
        />
        <Form.Control.Feedback type="invalid">
          {fieldErrors.email}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Senha</Form.Label>
        <Form.Control
          type="password"
          placeholder="Sua senha"
          value={loginForm.senha}
          onChange={e => {
            setLoginForm({...loginForm, senha: e.target.value});
            // Limpa mensagem de erro quando o usuário começa a digitar
            if (fieldErrors.senha) setFieldErrors(prev => ({...prev, senha: ''}));
          }}
          required
          isInvalid={!!fieldErrors.senha}
        />
        <Form.Control.Feedback type="invalid">
          {fieldErrors.senha}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Nunca compartilharemos seus dados com terceiros.
        </Form.Text>
      </Form.Group>
      <div className="d-grid gap-2">
        <Button variant="primary" size="lg" type="submit" className="mt-3">
          Entrar
        </Button>
      </div>
    </Form>
  );

  const renderRegisterForm = () => (
    <Form onSubmit={handleRegister}>
      <Form.Group className="mb-3">
        <Form.Label>Nome Completo</Form.Label>
        <Form.Control
          type="text"
          value={registerForm.nome}
          onChange={e => {
            setRegisterForm({...registerForm, nome: e.target.value});
            // Limpar erro quando o usuário começa a digitar
            if (registerFieldErrors.nome) setRegisterFieldErrors(prev => ({...prev, nome: ''}));
          }}
          required
          isInvalid={!!registerFieldErrors.nome}
        />
        <Form.Control.Feedback type="invalid">
          {registerFieldErrors.nome}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={registerForm.email}
          onChange={e => {
            setRegisterForm({...registerForm, email: e.target.value});
            if (registerFieldErrors.email) setRegisterFieldErrors(prev => ({...prev, email: ''}));
          }}
          required
          isInvalid={!!registerFieldErrors.email}
        />
        <Form.Control.Feedback type="invalid">
          {registerFieldErrors.email}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Senha</Form.Label>
        <Form.Control
          type="password"
          value={registerForm.senha}
          onChange={e => {
            setRegisterForm({...registerForm, senha: e.target.value});
            if (registerFieldErrors.senha) setRegisterFieldErrors(prev => ({...prev, senha: ''}));
          }}
          required
          isInvalid={!!registerFieldErrors.senha}
        />
        <Form.Control.Feedback type="invalid">
          {registerFieldErrors.senha}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Telefone</Form.Label>
        <Form.Control
          type="tel"
          placeholder="(XX) XXXXX-XXXX"
          value={registerForm.telefone}
          onChange={e => {
            setRegisterForm({...registerForm, telefone: e.target.value});
            if (registerFieldErrors.telefone) setRegisterFieldErrors(prev => ({...prev, telefone: ''}));
          }}
          isInvalid={!!registerFieldErrors.telefone}
        />
        <Form.Control.Feedback type="invalid">
          {registerFieldErrors.telefone}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Endereço</Form.Label>
        <Form.Control
          type="text"
          placeholder="Rua, número, bairro, cidade"
          value={registerForm.endereco}
          onChange={e => {
            setRegisterForm({...registerForm, endereco: e.target.value});
            if (registerFieldErrors.endereco) setRegisterFieldErrors(prev => ({...prev, endereco: ''}));
          }}
          isInvalid={!!registerFieldErrors.endereco}
        />
        <Form.Control.Feedback type="invalid">
          {registerFieldErrors.endereco}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Data de Nascimento</Form.Label>
        <DatePicker
          selected={registerForm.dataNascimento}
          onChange={date => {
            setRegisterForm({...registerForm, dataNascimento: date});
            if (registerFieldErrors.dataNascimento) setRegisterFieldErrors(prev => ({...prev, dataNascimento: ''}));
          }}
          dateFormat="dd/MM/yyyy"
          className={`form-control ${registerFieldErrors.dataNascimento ? 'is-invalid' : ''}`}
          placeholderText="Selecione uma data"
          maxDate={new Date()}
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={100}
        />
        {registerFieldErrors.dataNascimento && (
          <div className="invalid-feedback" style={{ display: 'block' }}>
            {registerFieldErrors.dataNascimento}
          </div>
        )}
      </Form.Group>
      <Button type="submit" className="mt-3">Registrar</Button>
    </Form>
  );

  const renderAgendarAulaForm = () => (
    <Form onSubmit={handleAgendarAula}>
      <Form.Group className="mb-3">
        <Form.Label>Data</Form.Label>
        <DatePicker
          selected={aulaForm.data}
          onChange={date => setAulaForm({...aulaForm, data: date})}
          showTimeSelect
          dateFormat="Pp"
          className="form-control"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Tipo</Form.Label>
        <Form.Control
          as="select"
          value={aulaForm.tipo}
          onChange={e => setAulaForm({...aulaForm, tipo: e.target.value})}
        >
          <option value="TEORICA">Teórica</option>
          <option value="PRATICA">Prática</option>
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Tutor</Form.Label>
        <Form.Control
          as="select"
          value={aulaForm.tutorId}
          onChange={e => setAulaForm({...aulaForm, tutorId: e.target.value})}
        >
          <option value="">Selecione um tutor...</option>
          {tutores.map(tutor => (
            <option key={tutor.id} value={tutor.id}>
              {tutor.nome} - {tutor.especialidade}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Button type="submit" className="mt-3">Agendar Aula</Button>
    </Form>
  );

  // Renderização principal
  return (
    <Container className="py-4">
      {!token ? (
        <Card>
          <Card.Body>
            {message && <Alert variant="success" onClose={() => setMessage('')} dismissible>{message}</Alert>}
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            
            <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
              <Nav.Item>
                <Nav.Link eventKey="login">Login</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="register">Registro</Nav.Link>
              </Nav.Item>
            </Nav>
            <div className="mt-3">
              {activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
            </div>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="d-flex justify-content-between mb-4">
            <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
              <Nav.Item>
                <Nav.Link eventKey="aulas">Minhas Aulas</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="agendar">Agendar Aula</Nav.Link>
              </Nav.Item>
            </Nav>
            <Button variant="outline-danger" onClick={handleLogout}>Sair</Button>
          </div>

          {message && <Alert variant="success" onClose={() => setMessage('')} dismissible>{message}</Alert>}
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

          {activeTab === 'aulas' ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Tutor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {aulas.map(aula => (
                  <tr key={aula.id}>
                    <td>{new Date(aula.data).toLocaleString()}</td>
                    <td>{aula.tipo}</td>
                    <td>{tutores.find(t => t.id === aula.TutorId)?.nome}</td>
                    <td>{aula.status}</td>
                    <td>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        disabled={aula.status !== 'AGENDADA'}
                        onClick={() => handleCancelarAula(aula.id)}
                      >
                        Cancelar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            renderAgendarAulaForm()
          )}
        </>
      )}
    </Container>
  );
}

export default App;
