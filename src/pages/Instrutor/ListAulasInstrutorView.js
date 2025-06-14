import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';
import DateTimePicker from '../../components/DateTimePicker.js';
import { formatarDataParaSalvar } from '../../utils/dataFormat';
import RenderAula from '../../components/RenderAula.js';
import ButtonBack from '../../components/ButtonBack.js';
import DatePicker from '../../components/DatePicker..js';

import useInstrutorStore from '../../store/useInstrutorStore';

import useInstrutor from '../../hooks/useInstrutor';

export default function ListAulasInstrutorView() {

    const { SearchAulasInstrutor } = useInstrutor();

    const { instrutor } = useInstrutorStore();
    const [loading, setLoading] = useState(false);
    const [aulas, setAulas] = useState([])
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleDateChange = async (selectedDate) => {
        setLoading(true);
        setError(null);
        const formattedDate = formatarDataParaSalvar(selectedDate);
        try {
            const data = await SearchAulasInstrutor(instrutor.instrutor_id, formattedDate);
            if (data.length === 0) {
                setError('Nenhuma aula encontrada.');
            }
            setAulas(data);
        } catch (err) {
            setError(error.message);
            setError('Erro ao buscar aulas para a data selecionada.');
        } finally {
            setLoading(false);
        }
    };


    const renderAulaItem = (item) => (
        <RenderAula key={item.aula_id} item={item} tipo={1} />
    );

    return (
        <div className="flex flex-col w-screen p-6 gap-2 h-screen max-w-[800px] items-center justify-start">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Aulas</h1>

            <DatePicker
                onChange={handleDateChange}
                dias={7}
            />

            {loading && <LoadingIndicator />}

            {error || aulas.length === 0 ? (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded mb-4 text-center">
                    <p>{error ? `Erro: ${error}` : 'Nenhuma aula marcada!'}</p>
                </div>
            ) : (
                <div className="flex flex-col max-h-[400px] overflow-y-auto w-full">
                    {aulas.map(renderAulaItem)}
                </div>
            )}
        </div>
    );

}
