import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';
import Modal from '../components/Modal';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../components/Button';
import ButtonBack from '../components/ButtonBack';
import ButtonHome from '../components/ButtonHome';

import useAulaStore from '../store/useAulaStore';
import useUserStore from '../store/useUserStore';
import { formatarDataParaExibir } from '../utils/dataFormat';
import { ToastContainer } from 'react-toastify';
import useAula from '../hooks/useAula.js';

export default function Confirm() {

  const { InsertClass, loading, error } = useAula();

  //#region Logica
  const { aula } = useAulaStore.getState();
  const { usuario } = useUserStore();
  const instrutor = aula.instrutor;
  const veiculo = aula.veiculo;
  const type = aula.tipo;
  const data = aula.data;
  const hora = aula.hora;

  const navigate = useNavigate();
  const [date] = useState(data);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = (message) => {
    setModalMessage(message);
    setModalVisible(!isModalVisible);
  };
  // useEffect(() => {

  //   console.log((configs.find(item => item.chave === type)).valor);
  // }, []);

  const handleConfirm = async () => {
    // Inserir a aula com base no tipo de usuário
    const aula = {
      instrutor_id: instrutor.instrutor_id,
      aluno_id: usuario.usuario_id,
      data: date,
      tipo: type,
      hora: hora,
      veiculo_id: veiculo.veiculo_id,
      autoescola_id: usuario.autoescola_id,
      marcada_por: 1, 
      configuracoes: usuario.configuracoes
    };

    const result = await InsertClass(aula);
    console.log(result);
    if (error) {
      toggleModal(error);
      return;
    }

    if (result === "Aula criada com sucesso") {
      navigate('/fim');
    } else {
      toggleModal(result);
      return;
    }

  };
  //#endregion

  return (
    <div className="flex flex-col  px-4 py-6 bg-white shadow-md rounded-xl max-w-2xl mx-auto">
      <div className="flex justify-between items-center w-full mb-6">
        <ButtonBack event={() => navigate('/selecionarDataEHora')} />
        <ButtonHome event={() => navigate('/home')} />
      </div>

      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">Confirme sua Aula</h1>

      <div className="space-y-3 mb-6">
        <h3 className="text-lg text-gray-700">
          <span className="font-semibold">Tipo da Aula:</span> {type}
        </h3>
        <h3 className="text-lg text-gray-700">
          <span className="font-semibold">Instrutor:</span> {instrutor.nome_instrutor}
        </h3>
        <h3 className="text-lg text-gray-700">
          <span className="font-semibold">Data Selecionada:</span> {formatarDataParaExibir(date)}
        </h3>
        <h3 className="text-lg text-gray-700">
          <span className="font-semibold">Hora da Aula:</span> {hora}
        </h3>
      </div>

      <LoadingIndicator visible={loading} />

      <Button
        onClick={loading ? null : handleConfirm}
        disabled={loading}
        className="mt-4"
      >
        {loading ? 'Processando...' : 'Finalizar'}
      </Button>

      <ToastContainer />

      <Modal
        isOpen={isModalVisible}
        onConfirm={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      >
        <p className="text-gray-800">{modalMessage}</p>
        <Button onClick={() => setModalVisible(false)} className="mt-4">
          Ok
        </Button>
      </Modal>
    </div>

  );
};

