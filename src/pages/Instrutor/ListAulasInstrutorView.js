import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { ClassModel } from '../../pageModel/ClassModel.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import Modal from '../../components/Modal';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

export default function ListAulasInstrutorView() {

    //#region  Logica
    const location = useLocation();
    const { codigo, nome } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [aulas, setAulas] = useState([]);
    const [currentTime, setCurrentTime] = useState(null);
    const [currentDate, setCurrentDate] = useState(null);
    const classModel = new ClassModel();
    const navigate = useNavigate();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAula, setSelectedAula] = useState(null);
    const [modalAction, setModalAction] = useState(null);
    const [date, setDate] = useState(null);

    const showToast = (type, text1, text2) => {
        toast.dismiss();
        toast[type](`${text1}: ${text2}`);
    };

    const handleDateChange = async (selectedDate) => {
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
        if (
            moment(selectedDate).isBetween(
                moment(currentDate),
                moment(currentDate).add(7, 'days'),
                'day',
                '[]'
            )
        ) {
            setDate(selectedDate);
            try {
                const data = await classModel.searchAulasInstrutor(codigo, formattedDate);
                setAulas(data.aulas || []);
            } catch (err) {
                setError('Erro ao buscar aulas para a data selecionada.');
            }
        } else {
            showToast('error', 'Erro', 'Data fora do intervalo permitido!');
        }
    };

    const fetchAulas = async () => {
        setLoading(true);
        setError(null);
        try {
            const formattedDate = moment(date || currentDate).format('YYYY-MM-DD');
            const data = await classModel.searchAulasInstrutor(codigo, formattedDate);
            setAulas(data.aulas || []);
            if (!data.aulas || !data.count) {
                setError('Nenhuma aula encontrada.');
            }
        } catch (error) {
            setError(error.message);
            showToast('error', 'Erro ao buscar Aulas', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const { currentTime, currentDate } = await classModel.getCurrentTimeAndDateFromServer();
                const parsedTime = moment(currentTime, 'HH:mm:ss');
                const parsedDate = moment(currentDate, 'YYYY-MM-DD');
                setCurrentTime(parsedTime);
                setCurrentDate(parsedDate);
                if (!date) {
                    setDate(parsedDate.toDate());
                }
            } catch (err) {
                setError('Erro ao carregar dados iniciais.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [codigo]);

    const handleAction = (action, item) => {
        const itemDate = moment(item.data, 'YYYY-MM-DD');
        const itemTime = moment(item.hora, 'HH:mm:ss');
        if (action === 'Excluir') {
            setSelectedAula(item);
            setModalAction('Excluir');
            setModalVisible(true);
        } else if (action === 'Confirmar') {
            if (itemDate.isBefore(currentDate) || (itemDate.isSame(currentDate) && itemTime.isBefore(currentTime))) {
                setSelectedAula(item);
                setModalAction('Confirmar');
                setModalVisible(true);
            } else {
                showToast('error', 'Erro', 'Muito cedo para concluir a aula!');
            }
        }
    };

    const confirmAction = async () => {
        if (selectedAula && selectedAula.aula_id) {
            try {
                if (modalAction === 'Excluir') {
                    const res = await classModel.deleteAula(selectedAula.aula_id, selectedAula.data, selectedAula.hora);
                    showToast(res ? 'success' : 'error', res ? 'Sucesso' : 'Erro', res ? 'Aula excluída com sucesso!' : 'Não foi possível excluir a aula.');
                }
                fetchAulas();
                setModalVisible(false);
                setSelectedAula(null);
            } catch (error) {
                showToast('error', 'Erro', error.message);
            }
        }
    };

    const renderAulaItem = (item) => (
        <div style={styles.itemContainer} key={item.aula_id}>
            <p style={styles.itemTitle}>Data: {moment(item.data).format('DD/MM/YYYY')}</p>
            <p style={styles.itemText}>Tipo: {item.tipo}</p>
            <p style={styles.itemText}>Hora: {item.hora}</p>
            <p style={styles.itemText}>Aluno: {item.usuarios?.nome || 'Não especificado'}</p>
            <div style={styles.buttonContainer}>
                <button style={styles.deleteButton} onClick={() => handleAction('Excluir', item)}>Excluir</button>
            </div>
        </div>
    );

    //#endregion
    
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Aulas</h1>
            <DatePicker
                selected={date}
                onChange={handleDateChange}
                minDate={currentDate ? currentDate.toDate() : null}
                maxDate={currentDate ? moment(currentDate).add(7, 'days').toDate() : null}
                dateFormat="dd/MM/yyyy"
            />
            {loading && <LoadingIndicator />}
            {error || aulas.length === 0 ? (
                <div style={styles.errorContainer}>
                    <p style={styles.errorText}>{error || 'Nenhuma aula marcada!'}</p>
                </div>
            ) : (
                <div style={styles.flatListContainer}>{aulas.map(renderAulaItem)}</div>
            )}
            <button style={styles.buttonBack} onClick={() => navigate(`/homeinstrutor`, { state: { codigo, nome } })}>Voltar</button>
            <Modal
                isOpen={modalVisible}
                onConfirm={confirmAction}
                onCancel={() => setModalVisible(false)}
            >
                <p>{modalAction === 'Excluir' ? `Deseja excluir a aula ${selectedAula?.tipo}?` : `Deseja confirmar a aula de tipo: ${selectedAula?.tipo}?`}</p>
            </Modal>
            <ToastContainer position="top-center" />
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        marginTop: '100px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh', // Permite crescimento para conteúdo
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', // Evita corte no centro
    },
    title: {
        fontSize: '1.5em',  // Ajustado para manter o tamanho de título semelhante ao Home
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#003366', // Azul escuro para manter a consistência com Home
    },
    sub_title: {
        fontSize: '1em',  // Ajustado para manter o tamanho de título semelhante ao Home
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#003366', // Azul escuro para manter a consistência com Home
        justifyContent: 'center',
        textAlign: 'center'
    },
    flatListContainer: {
        width: '100%',
        maxHeight: '70vh', // Limita a altura máxima
        overflowY: 'auto', // Habilita a rolagem vertical
        padding: '10px', // Adiciona espaçamento interno
        boxSizing: 'border-box', // Garante que padding não ultrapasse o tamanho definido
    },
    errorContainer: {
        color: 'red',
    },
    itemContainer: {
        backgroundColor: '#D9D9D9',
        borderRadius: '12px',  // Arredondando mais para alinhar com o Home
        padding: '20px',
        margin: '10px 0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',  // Sombra leve
    },
    buttonContainer: {
        marginTop: '10px',
    },
    deleteButton: {
        backgroundColor: '#FF4C4C',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',  // Arredondamento consistente
        margin: '5px',
        cursor: 'pointer',
        border: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Sombra leve
        transition: 'background 0.3s',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px', // Arredondamento consistente
        margin: '5px',
        cursor: 'pointer',
        border: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Sombra leve
        transition: 'background 0.3s',
    },
    buttonBack: {
        width: '40%', // Tamanho ajustado para similar ao botão na Home
        backgroundColor: '#0074D9', // Azul médio (igual ao botão 'Voltar' em Home)
        borderRadius: '12px',
        color: '#fff',
        fontWeight: 'bold',
        padding: '15px',
        cursor: 'pointer',
        marginTop: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: 'none',
        transition: 'background 0.3s',
    },
    modalContent: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '15px',  // Ajustado para borda arredondada similar
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)', // Sombra mais visível
        textAlign: 'center',
    },
    modalButtons: {
        display: 'flex',
        justifyContent: 'center',
    },
    modalButton: {
        backgroundColor: '#0056b3', // Azul escuro como na Home
        color: '#fff',
        padding: '10px 20px',
        marginTop: '10px',
        cursor: 'pointer',
        borderRadius: '8px',
        border: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',  // Sombra leve
        transition: 'background 0.3s',
    },
};