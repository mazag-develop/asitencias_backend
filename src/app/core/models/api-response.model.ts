export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Paginacion {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface RespuestaPaginada<T> {
  data: T[];
  paginacion: Paginacion;
}
