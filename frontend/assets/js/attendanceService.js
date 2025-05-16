// Servicio encapsulado para manejar la asistencia
export const AttendanceService = (() => {
    const STORAGE_KEY = 'attendance';

    // Métodos privados
    const getAttendanceData = () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    };

    // API
    return {
        markPlayer: (teamId, playerId) => {
            const data = getAttendanceData();
            data[teamId] = data[teamId] || [];

            const index = data[teamId].indexOf(playerId);
            if(index === -1)
                data[teamId].push(playerId);            // Marcar como presente            
            else
                data[teamId].splice(index, 1);          // Quitar marca

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return data[teamId].includes(playerId);     // Retorna nuevo estado
        },

        getTeamAttendance: (teamId) => {
            const data = getAttendanceData();
            return new Set(data[teamId] || []);
        },

        clearTeamAttendance: (teamId) => {
            const data = getAttendanceData();
            delete data[teamId];

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    };
})();