import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LoadingIndicator from '../../components/LoadingIndicator';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Count from '../../components/Count';

import useAula from '../../hooks/useAula';

import useAulaStore from '../../store/useAulaStore';
import useUserStore from '../../store/useUserStore';

export default function SelectVeicle() {

    //#region Logica
    const { updateAula, aula } = useAulaStore.getState();
    const { SelectVeicleByInstrutor } = useAula();
    const { usuario } = useUserStore();

    const [veiculos, setVeiculos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedVeicle, setSelectedVeicle] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchVeicles = async () => {
            if (!usuario || !aula) {
                showToast('Erro', 'Usuário e Tipo são necessários.');
                return;
            }
            setLoading(true);
            try {
                const veiclesData = await SelectVeicleByInstrutor(aula.instrutor.instrutor_id, aula.tipo, usuario.autoescola_id);
                setVeiculos(veiclesData || []); // Garante que seja um array                
            } catch (error) {
                showToast('Erro', 'Ocorreu um erro ao buscar os veículos.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchVeicles();
    }, [usuario, aula, SelectVeicleByInstrutor]);

    const showToast = (title, message) => {
        toast.dismiss();
        toast.error(`${title}: ${message}`, { position: 'top-center' });
    };

    const handleButtonClick = (value) => {
        setSelectedVeicle(value);
        setModalVisible(true);
    };

    const confirmSelection = () => {
        setModalVisible(false);
        if (!selectedVeicle) {
            showToast('Erro', 'Selecione um veículo primeiro.');
            return;
        }
        updateAula('veiculo', selectedVeicle);
        navigate('/selecionarDataEHora');
    };

    const renderVeicleItem = (item) => (
        <div className='flex bg-gray-100 border border-gray-200 shadow-md p-3 rounded-xl align-middle justify-start gap-3' key={item.veiculo_id} onClick={() => handleButtonClick(item)}>
            <div className='w-full text-start'>
                <h1>Veiculo: </h1>
                <h1 className='font-bold text-4xl capitalize'>{item.modelo}</h1>
                <Button className='mt-2'>
                    Selecionar
                    <span className="material-icons">arrow_forward_ios</span>
                </Button>
            </div>
        </div >
    );

    const onCancel = () => {
        setModalVisible(false);
        setSelectedVeicle(null);
    };

    //#endregion

    return (
        <div className='flex flex-col gap-5 p-3 w-screen h-screen items-center justify-center'>
            <LoadingIndicator visible={loading} />
            <h1 className='text-2xl font-bold'>Selecionar Veiculo</h1>
            <h2>
                Clique no veículo que deseja utilizar na aula!
            </h2>
            {veiculos.length === 0 ? (
                <div className='flex flex-col'>
                    <p className='text-error'>
                        {'Nenhum veículo encontrado, entre em contato com o suporte!'}
                    </p>
                    <span className="material-icons">error</span>
                </div>
            ) : (
                <div className='flex flex-col gap-3 max-h-[400px] overflow-y-auto w-full max-w-[800px]'>
                    {veiculos.map(renderVeicleItem)}
                </div>
            )}
            <Count num={3} />
            <Modal isOpen={modalVisible}>
                <p>Você tem certeza que deseja selecionar o veículo: <strong>{selectedVeicle?.modelo}</strong>?</p>
                <Button onClick={confirmSelection} type={4}>Sim
                    <span className="material-icons">
                        check
                    </span></Button>
                <Button onClick={() => onCancel()} type={3}>Não
                    <span className="material-icons">
                        close
                    </span></Button>
            </Modal>

            <ToastContainer />
        </div>
    );
}
