import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
  Pagination,
  Alert
} from 'react-bootstrap';

function App() {
  // Estados para gerenciamento dos dados
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
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
  const [searchData, setSearchData] = useState({
    nome: '',
    curso: '',
    cidade: '',
    estado: '',
    idade: ''
  });
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');

  // Buscar alunos com paginação
  const fetchStudents = async (page = 1) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/students?page=${page}&limit=10`);
      setStudents(response.data.students);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setMessage('Erro ao carregar alunos: ' + error.message);
    }
  };

  // Buscar estatísticas
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost