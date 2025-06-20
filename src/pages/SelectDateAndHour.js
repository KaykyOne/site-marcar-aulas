import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';
import Button from '../components/Button';
import Count from '../components/Count';

import useAula from '../hooks/useAula';
import useGeneric from '../hooks/useGeneric';
import useAulaStore from '../store/useAulaStore';
import useUserStore from '../store/useUserStore';
import { format, isBefore, addDays, subDays, isAfter } from 'date-fns';
import { formatarDataParaSalvar } from '../utils/dataFormat';
import DatePicker from '../components/DatePicker.';

export default function SelectDateAndHour() {

  const { PegarData } = useGeneric();
  const { SearchAndFilterHour } = useAula();

  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [horas, setHoras] = useState([]);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [date, setDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
  const [dayName, setDayName] = useState('');

  const { updateAula, aula } = useAulaStore.getState();
  const instrutor = aula?.instrutor?.instrutor_id;
  const veiculo = aula?.veiculo?.veiculo_id;

  const namesForDays = ["Erro", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

  const fetchInitialData = useCallback(async () => {
    try {
      const now = await PegarData(); // Pega data e hora atual
      const dataAtual = now.split('T'); // Formata data
      setCurrentDate(dataAtual[0]);
      setCurrentTime(dataAtual[1]);


      // Busca feriados da API BrasilAPI
      const response = await fetch('https://brasilapi.com.br/api/feriados/v1/2024');
      if (!response.ok) throw new Error('Erro ao buscar feriados');

      const data = await response.json();
      setHolidays(data.map(holiday => holiday.date));
    } catch (error) {
      toast.error('Erro ao buscar os dados iniciais.');
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  }, []);


  const fetchHours = useCallback(async () => {
    if (!date) return;

    const dayOfWeek = format(date, 'i');
    setDayName(namesForDays[dayOfWeek]);

    if (+dayOfWeek === 7 || +dayOfWeek === 6) { // o retorno do 'i' é string? Se for string, compara com string
      setHoras([]);
      return;
    }

    setLoading(true);
    try {
      const result = await SearchAndFilterHour(instrutor, veiculo, date);
      setHoras(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [date, instrutor, veiculo, SearchAndFilterHour]);


  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (date) fetchHours();
  }, [date, fetchHours]);

  const handleDateChange = (selectedDate) => {
    if (isAfter(currentDate, selectedDate)) {
      return;
    }
    // console.log(selectedDate)
    if (!date) {
      setDate(selectedDate);
      return;
    }
    if (isAfter(selectedDate, addDays(currentDate, 7))) {
      toast.error('Data muito longe!');
      return;
    }

    setDate(selectedDate);
  };

  const handleHourClick = (hora) => {
    const selectedHourParsed = new Date(`1970-01-01T${hora}:00`); // Parse a hora
    if (isBefore(selectedHourParsed, new Date(currentTime)) && isBefore(date, new Date())) {
      toast.error('Hora anterior à atual. Escolha outro horário!');
    } else {
      setSelectedHour(hora);
      setModalVisible(true);
    }
  };

  const confirmSelection = () => {
    setModalVisible(false);
    updateAula('hora', selectedHour);
    const dataFormatada = formatarDataParaSalvar(date)
    updateAula('data', dataFormatada);
    // console.log(selectedHour, " asdasdda ", dataFormatada)
    navigate('/confirmar');
  };

  if (initialLoading) {
    return <LoadingIndicator visible />;
  }

  return (
    <div className='flex flex-col h-screen w-screen mt-10 p-5 max-w-[800px] items-center'>
      <h1 className='font-bold text-2xl mb-4 capitalize'>Selecionar data e hora</h1>
      <h2 className='mb-4'>Mude a data e escolha a hora!</h2>
      <DatePicker
        onChange={handleDateChange}
        dias={7}
      />
      <LoadingIndicator visible={loading} />
      {error && <p className='text-error'>{error}</p>}

      <h1 className='font-semibold'>Horários disponíveis:</h1>
      <div className='flex flex-col gap-5 mt-3 h-full w-full items-center max-h-[300px] overflow-y-auto'>
        {holidays.includes(format(date, 'yyyy-MM-dd')) ||
          format(date, 'i') === 7 ||
          format(date, 'i') === 6 ? (
          <div className='container-error'>
            <p className='text-error'>
              {'Nenhum horário disponível essa data!'}
            </p>
          </div>
        ) : horas.length > 0 ? (
          horas.map((hora, index) => (
            <Button back={'#4B003B'} className='w-full max-w-[300px]' key={index} onClick={() => handleHourClick(hora)}>
              {hora}
            </Button>
          ))
        ) : (
          <div className='flex flex-col h-full justify-center items-center'>
            <span className="material-icons !text-6xl text-red-600">
              warning
            </span>
            <p className='text-xl text-red-600 font-medium'>
              {'Nenhum horário disponível essa data!'}
            </p>
          </div>
        )}
      </div>


      <Modal isOpen={modalVisible}>
        <p>Você tem certeza que deseja selecionar essa data: <strong>{format(date, 'dd/MM/yyyy')} </strong>  ás <strong>{selectedHour}</strong> </p>
        <Button onClick={confirmSelection} type={4}>Sim
          <span className="material-icons">
            check
          </span></Button>
        <Button onClick={() => setModalVisible(false)} type={3}>Não
          <span className="material-icons">
            close
          </span></Button>
      </Modal>
      <Count className='bottom-0' num={4} />
      <ToastContainer />
    </div>
  );
}
