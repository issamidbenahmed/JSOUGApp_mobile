import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, IconButton, Tooltip, Box, Modal
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';

const getPhotoUrl = (photo) => {
  if (!photo) return '';
  if (photo.startsWith('http')) return photo;
  return `http://localhost:5000${photo.startsWith('/') ? '' : '/'}${photo}`;
};

export default function MoniteursList() {
  const [moniteurs, setMoniteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [modalImg, setModalImg] = useState('');

  const fetchMoniteurs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/moniteurs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMoniteurs(res.data);
    } catch (err) {
      setError('Erreur lors du chargement');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMoniteurs();
  }, []);

  const handleValidate = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/admin/moniteurs/${id}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMoniteurs();
    } catch (err) {
      alert('Erreur lors de la validation');
    }
  };

  const handleOpenModal = (imgUrl) => {
    setModalImg(imgUrl);
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <h2 style={{ textAlign: 'left', marginBottom: 32, marginLeft: 8 }}>Liste des moniteurs</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      <TableContainer component={Paper} sx={{ boxShadow: 2, width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#FFF3E0' }}>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Permis</TableCell>
              <TableCell>Voitures</TableCell>
              <TableCell>Certificats</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center">Chargement...</TableCell></TableRow>
            ) : moniteurs.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">Aucun moniteur</TableCell></TableRow>
            ) : moniteurs.map(m => (
              <TableRow key={m.id} hover>
                <TableCell>{m.fullName}</TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>
                  {m.licenses && m.licenses.length > 0 ? m.licenses.map(l => (
                    <Chip key={l.type} label={l.type} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  )) : <Chip label="Aucun" size="small" color="default" />}
                </TableCell>
                <TableCell>
                  {m.cars && m.cars.length > 0 ? m.cars.map(car => (
                    <Tooltip key={car.id} title={car.model || 'Voiture'}>
                      {car.photos && car.photos.length > 0 ? car.photos.map((p, idx) => (
                        <IconButton key={idx} onClick={() => handleOpenModal(getPhotoUrl(p.photo_url || p))}>
                          <VisibilityIcon />
                        </IconButton>
                      )) : <BlockIcon color="disabled" />}
                    </Tooltip>
                  )) : <BlockIcon color="disabled" />}
                </TableCell>
                <TableCell>
                  {m.certificates && m.certificates.length > 0 ? m.certificates.map((c, idx) => (
                    <IconButton key={idx} onClick={() => handleOpenModal(getPhotoUrl(c.photo_url))}>
                      <VisibilityIcon />
                    </IconButton>
                  )) : <BlockIcon color="disabled" />}
                </TableCell>
                <TableCell>
                  {m.isValidated ? (
                    <Chip icon={<CheckCircleIcon sx={{ color: '#4CAF50' }} />} label="Validé" color="success" />
                  ) : (
                    <Chip label="Non validé" color="warning" />
                  )}
                </TableCell>
                <TableCell>
                  {!m.isValidated && (
                    <Button variant="contained" color="success" size="small" onClick={() => handleValidate(m.id)}>
                      Valider
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={openModal} onClose={handleCloseModal} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={modalImg} alt="aperçu" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 4px 32px #0003' }} />
      </Modal>
    </Box>
  );
} 