const axios = require('axios');
require('colors');

const API_URL = 'http://localhost:3000/api/v1';

// HER SEFERİNDE FARKLI BİR TEST KULLANICISI OLUŞTURALIM Kİ ÇAKIŞMA OLMASIN
const randomId = Math.floor(Math.random() * 10000);
const TEST_USER = {
    email: `testuser${randomId}@mediflow.com`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '5551234567'
};

// STRAPI DOKTOR ID (Bunu değiştirmene gerek yok, 4 demiştik)
const DOCTOR_ID = 4; 
const TARGET_DATE = '2025-12-28';

async function runTests() {
    console.log('\n🚀 MEDIFLOW BACKEND OTO-TEST (SELF-HEALING) BAŞLIYOR...\n'.bold.cyan);
    let token = '';
    let userId = '';

    try {
        // 1. ADIM: KAYIT OL (REGISTER)
        process.stdout.write(`1. Kullanıcı Oluşturuluyor (${TEST_USER.email})... `);
        try {
            await axios.post(`${API_URL}/auth/register`, TEST_USER);
            console.log('✅ BAŞARILI (Yeni Kayıt)'.green);
        } catch (error) {
            // Eğer kullanıcı zaten varsa sorun değil, devam et
            if (error.response && error.response.status === 409) {
                console.log('⚠️ Zaten Kayıtlı (Devam ediliyor)'.yellow);
            } else {
                throw error; // Başka hataysa patlat
            }
        }

        // 2. ADIM: LOGIN
        process.stdout.write('2. Login Olunuyor... ');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        token = loginRes.data.accessToken;
        console.log('✅ BAŞARILI'.green);

        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        // 3. ADIM: PROFİL KONTROL
        process.stdout.write('3. Profil Kontrolü... ');
        const profileRes = await axios.get(`${API_URL}/users/profile`, authHeader);
        userId = profileRes.data.id;
        console.log('✅ BAŞARILI'.green);

        // 4. ADIM: DOKTOR SAATLERİ
        process.stdout.write(`4. Doktor (ID: ${DOCTOR_ID}) Saatleri... `);
        const slotsRes = await axios.get(`${API_URL}/appointments/available-slots?doctorId=${DOCTOR_ID}&date=${TARGET_DATE}`, authHeader);
        
        if (Array.isArray(slotsRes.data)) {
            console.log('✅ BAŞARILI'.green);
            console.log(`   --> ${slotsRes.data.length} adet boş saat bulundu.`.gray);
        } else {
            throw new Error('Saat verisi dizi olarak gelmedi!');
        }

        // 5. ADIM: RANDEVU ALMA
        process.stdout.write('5. Randevu Alınıyor... ');
        const bookBody = {
            appointmentDate: `${TARGET_DATE}T10:00:00.000Z`, 
            strapiDoctorId: DOCTOR_ID,
            notes: "Otomatik Test Scripti ile alındı"
        };
        
        const bookRes = await axios.post(`${API_URL}/appointments`, bookBody, authHeader);
        console.log('✅ BAŞARILI'.green);
        console.log(`   --> Randevu ID: ${bookRes.data.id} oluşturuldu.`.yellow);

    } catch (error) {
        console.log('❌ BAŞARISIZ'.red);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            // Hata mesajını düzgün göstermesi için düzelttim:
            console.log(`   Detay: ${JSON.stringify(error.response.data)}`.red);
        } else {
            console.log(`   Hata: ${error.message}`.red);
        }
    }
    console.log('\n-----------------------------------');
}

runTests();
