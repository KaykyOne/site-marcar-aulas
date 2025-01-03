import supabase from '../controller/supabase';

export class LoginPageModel {
  users = [];

  async searchUsersByCPF(cpf) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('usuario_id, nome, senha, atividade, tipo_usuario')
      .eq('cpf', cpf)
      .single(); // Adiciona .single() para retornar apenas um resultado
    
    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null; // Retorna null em caso de erro
    }

    return data ? data : null; // Retorna apenas o campo 'nome'
  }

  async searchCodigoInstrutor(codigo) {
    const { data, error } = await supabase
      .from('instrutores')
      .select('instrutor_id')
      .eq('usuario_id', codigo)
      .single(); // Adiciona .single() para retornar apenas um resultado
    
    if (error) {
      console.error('Erro ao código do instrutor:', error);
      return null; // Retorna null em caso de erro
    }

    return data.instrutor_id ? data : null; // Retorna apenas o campo 'nome'
  }

  async verificarManutencao() {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'manutencao')
      .single();

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        return null; // Retorna null em caso de erro
      }
  
      return data ? data : null; // Retorna apenas o campo 'nome'
  }
}
