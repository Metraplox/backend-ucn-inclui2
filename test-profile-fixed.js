const axios = require('axios');

async function testStudentProfile() {
    const baseURL = 'http://localhost:3000';
    
    try {
        console.log('🧪 PRUEBA: Endpoint /students/profile con corrección aplicada');
        console.log('═'.repeat(60));
        
        // 1. Login como estudiante usando credenciales del sistema
        console.log('1. Autenticando como estudiante...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'estudiante@alumnos.ucn.cl',
            password: 'EstudianteUCN2025!'
        });

        const token = loginResponse.data.access_token;
        console.log('✅ Login exitoso');

        // 2. Probar el endpoint /students/profile
        console.log('\n2. Probando GET /students/profile...');
        const profileResponse = await axios.get(`${baseURL}/students/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ ENDPOINT FUNCIONA CORRECTAMENTE!');
        console.log('Datos del perfil:', {
            id: profileResponse.data._id,
            nombres: profileResponse.data.nombres,
            apellidos: profileResponse.data.apellidos,
            email: profileResponse.data.email,
            carreraId: profileResponse.data.carreraId,
            semester: profileResponse.data.semester,
            hasSpecialNeeds: profileResponse.data.hasSpecialNeeds
        });

        console.log('\n🎉 CORRECCIÓN EXITOSA: El endpoint /students/profile ya funciona!');
        console.log('La implementación se revirtió a usar findByUserId(user._id) como en el commit checkListo');

        return true;

    } catch (error) {
        console.error('❌ Error en la prueba:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url
        });
        
        if (error.response?.status === 500) {
            console.log('\n💡 Si aún hay error 500, es posible que necesites reiniciar el servidor');
            console.log('   para que los cambios surtan efecto.');
        }
        
        if (error.response?.status === 401) {
            console.log('\n💡 Probando con el segundo estudiante...');
            try {
                const loginResponse2 = await axios.post(`${baseURL}/auth/login`, {
                    email: 'estudiante2@alumnos.ucn.cl',
                    password: 'EstudianteUCN2025!'
                });

                const token2 = loginResponse2.data.access_token;
                console.log('✅ Login exitoso con segundo estudiante');

                const profileResponse2 = await axios.get(`${baseURL}/students/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token2}`
                    }
                });

                console.log('✅ ENDPOINT FUNCIONA CORRECTAMENTE!');
                console.log('Datos del perfil:', {
                    id: profileResponse2.data._id,
                    nombres: profileResponse2.data.nombres,
                    apellidos: profileResponse2.data.apellidos,
                    email: profileResponse2.data.email
                });

                return true;
            } catch (error2) {
                console.error('❌ Error también con segundo estudiante:', error2.response?.data?.message || error2.message);
                return false;
            }
        }
        
        return false;
    }
}

testStudentProfile(); 