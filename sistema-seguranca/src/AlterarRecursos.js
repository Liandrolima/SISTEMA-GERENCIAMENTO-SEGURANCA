import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";
import {
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { Box } from "@mui/material";
import imagemLogin from "./imagens/batmancarro.png"; // Importe corretamente a imagem

const AlterarRecursos = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role); // Atualiza o estado com o valor salvo no localStorage
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    try {
      setUserRole(jwtDecode(token).role);
    } catch {
      return navigate("/");
    }
    (async () => {
      try {
        const data = await api.getResources();
        setResources(data || []);
      } catch (err) {
        console.error("Erro ao carregar recursos:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleDeleteResource = async (id) => {
    if (!id) return console.error("Erro: ID inválido!");
    try {
      await api.deleteResource(id);
      setResources((prev) => prev.filter((res) => res.id !== id));
    } catch (error) {
      console.error("Erro ao remover recurso:", error);
    }
  };
  // Função para redirecionar para a tela de login
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remova o token do localStorage
    navigate("/"); // Redireciona para a página de login
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const getMaintenanceDateStatus = (maintenanceDate) => {
    if (!maintenanceDate) return { color: "white", text: "Sem manutenção" }; // Se não houver data, retorna 'Sem manutenção' e cor branca
    const currentDate = new Date();
    const maintenanceDateObj = new Date(maintenanceDate);
    const timeDifference = currentDate - maintenanceDateObj;
    const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;
    // Lógica invertida: se for até 1 semana, cor amarela, caso contrário, cor vermelha
    if (timeDifference <= oneWeekInMillis) {
      return {
        color: "yellow",
        text: "Prazo de manutenção acabando em sete dias",
      };
    } else {
      return { color: "red", text: "Prazo esgotado" };
    }
  };
  // Dentro do componente
  const maintenanceStatus = getMaintenanceDateStatus(
    editingResource?.maintenanceDate
  ); // Usa optional chaining para evitar erro se editingResource for null

  console.log(maintenanceStatus?.color);
  const handleSaveEdit = async () => {
    if (!editingResource || !editingResource.id) {
      console.error("Erro: ID do recurso inválido!");
      return;
    }
    try {
      await api.editResource(editingResource.id, editingResource);
      setResources((prev) =>
        prev.map((res) =>
          res.id === editingResource.id ? editingResource : res
        )
      );
      setEditingResource(null);
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
    }
  };

  return (
    <Paper
      sx={{
        padding: 3,
        margin: "20px",
        textAlign: "center",
        backgroundColor: "#121212",
        color: "#FFD700",
        boxShadow: "0px 4px 10px rgba(255, 215, 0, 0.5)",
        borderRadius: "10px",
      }}
    >
      {/* Grid item para a imagem (lado esquerdo) */}
      <Grid
        item
        xs={12}
        md={3}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          marginTop: "-10px",
          marginBottom: "-10%",
          marginLeft: "10%",
        }}
      >
        <img
          src={imagemLogin}
          alt="Imagem de Login"
          style={{
            width: "1000px", // Defina o tamanho que deseja para a imagem
            height: "150px", // A altura deve ser igual à largura para garantir que seja um círculo perfeito
            borderRadius: "50%", // Torna a imagem circular
            marginRight: "20px",
            objectFit: "cover", // Garante que a imagem se ajuste ao círculo sem distorções
            animation: "moveLeftRight 2s linear infinite",
          }}
        />
      </Grid>

      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", textTransform: "uppercase" }}
      >
        Painel de Controle
      </Typography>

      {/* Botão para voltar para a tela de login */}
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#FFD700",
          color: "#121212",
          fontWeight: "bold",
          marginTop: 2,
          "&:hover": { backgroundColor: "#C5A200" },
        }}
        onClick={handleLogout}
      >
        Voltar ao Login
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {loading ? (
        <CircularProgress sx={{ color: "#FFD700" }} />
      ) : resources.length > 0 ? (
        <TableContainer
          sx={{
            backgroundColor: "#1c1c1c",
            borderRadius: 2,
            boxShadow: "0 4px 10px rgba(255, 223, 0, 0.3)",
            marginTop: 3,
          }}
        >
          <Typography
            variant="h6"
            align="center"
            sx={{ marginTop: -1, color: "#FFD700", fontWeight: "bold" }}
          >
            Painel de Recursos
          </Typography>
          <Table sx={{ backgroundColor: "#1E1E1E", borderRadius: "10px" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#333", color: "#FFD700" }}>
                <TableCell sx={{ fontWeight: "bold", color: "#FFD700" }}>
                  Nome
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#FFD700" }}>
                  Status
                </TableCell>

                {(userRole === "admin" || userRole === "gerente") && (
                  <TableCell sx={{ fontWeight: "bold", color: "#FFD700" }}>
                    Ações
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map((resource) => (
                <TableRow
                  key={resource.id || resource.serialNumber}
                  sx={{ "&:hover": { backgroundColor: "#292929" } }}
                >
                  <TableCell sx={{ color: "#FFF" }}>{resource.name}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        resource.status === "Disponível"
                          ? "#00FF00"
                          : resource.status === "Em manutenção"
                          ? "#FFA500"
                          : "#FF0000",
                    }}
                  >
                    {resource.status}
                  </TableCell>
                  {(userRole === "admin" || userRole === "gerente") && (
                    <TableCell>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#1976D2",
                          color: "#FFF",
                          marginRight: 1,
                          "&:hover": { backgroundColor: "#125A9E" },
                        }}
                        onClick={() => setEditingResource(resource)}
                      >
                        Editar
                      </Button>

                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#D32F2F",
                          color: "#FFF",
                          "&:hover": { backgroundColor: "#A52A2A" },
                        }}
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" sx={{ marginTop: 2, color: "#FFD700" }}>
          Nenhum recurso encontrado.
        </Typography>
      )}
      {editingResource && (
        <Paper
          sx={{
            padding: 3,
            margin: "20px",
            backgroundColor: "#1c1c1c",
            color: "#f5f5f5",
            borderRadius: 2,
            boxShadow: "0px 0px 10px #ffcc00",
          }}
        >
          <Typography variant="h5" sx={{ color: "#F8D210" }}>
            Editar Recurso
          </Typography>

          <TextField
            fullWidth
            label="Nome"
            value={editingResource.name}
            onChange={(e) =>
              setEditingResource({ ...editingResource, name: e.target.value })
            }
            sx={{ backgroundColor: "#333", color: "#FFF", borderRadius: "4px" }}
            InputLabelProps={{ style: { color: "#F8D210" } }}
          />

          <TextField
            fullWidth
            label="Status"
            select
            value={editingResource.status}
            onChange={(e) => {
              const newStatus = e.target.value;
              let newResource = { ...editingResource, status: newStatus };
              newResource.maintenanceDate = new Date().toISOString();
              setEditingResource(newResource);
            }}
            SelectProps={{ native: true }}
            sx={{
              backgroundColor: "#333",
              color: "#FFF",
              borderRadius: "4px",
              marginTop: 2,
            }}
            InputLabelProps={{ style: { color: "#F8D210" } }}
          >
            <option value="Disponível">Disponível</option>
            <option value="Em manutenção">Em manutenção</option>
            <option value="Fora de uso">Fora de uso</option>
          </TextField>

          {editingResource.status === "Disponível" && (
            <TextField
              fullWidth
              label="Data de Disponibilidade"
              value={
                editingResource?.maintenanceDate
                  ? new Date(editingResource.maintenanceDate).toLocaleString()
                  : ""
              }
              InputProps={{ readOnly: true }}
              sx={{
                marginTop: 2,
                backgroundColor: "#008000",
                color: "#FFF",
                borderRadius: "4px",
              }}
              InputLabelProps={{ style: { color: "#FFF" } }}
            />
          )}

          {editingResource.status === "Em manutenção" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#FFD700",
                padding: 2,
                borderRadius: 1,
              }}
            >
              <TextField
                label="Data de Início da Manutenção"
                value={
                  editingResource?.maintenanceDate
                    ? new Date(editingResource.maintenanceDate).toLocaleString()
                    : ""
                }
                InputProps={{ readOnly: true }}
                sx={{
                  flexGrow: 1,
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#000",
                }}
                InputLabelProps={{ style: { color: "#000" } }}
              />
              <Typography variant="body2" sx={{ color: "#000", marginLeft: 1 }}>
                {maintenanceStatus.text}
              </Typography>
            </Box>
          )}

          {editingResource.status === "Fora de uso" && (
            <TextField
              fullWidth
              label="Data de Inatividade"
              value={
                editingResource?.maintenanceDate
                  ? new Date(editingResource.maintenanceDate).toLocaleString()
                  : ""
              }
              InputProps={{ readOnly: true }}
              sx={{
                marginTop: 2,
                backgroundColor: "#B22222",
                color: "#FFF",
                borderRadius: "4px",
              }}
              InputLabelProps={{ style: { color: "#FFF" } }}
            />
          )}

          <Button
            variant="contained"
            sx={{ backgroundColor: "#F8D210", color: "#000", marginTop: 2 }}
            onClick={handleSaveEdit}
          >
            Salvar Alterações
          </Button>
        </Paper>
      )}      
    </Paper>
  );
};

export default AlterarRecursos;
