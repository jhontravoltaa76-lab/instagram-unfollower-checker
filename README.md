# RavynSmith-Analyze

**Analisis Follower & Following Instagram Anda** — 100% berjalan di browser, tanpa server, tanpa login, dan data Anda tidak pernah dikirim ke mana pun.

## Fitur

- **Unfollowers** — lihat siapa saja yang Anda follow tapi tidak follow balik
- **Fans** — lihat siapa saja yang follow Anda tapi tidak Anda follow balik
- **Mutuals** — lihat akun yang saling follow dengan Anda
- Statistik total followers, following, unfollowers, fans, mutuals dalam bentuk grafik donat
- Dark mode
- Diproses sepenuhnya secara lokal di browser dan data pengguna **Tidak Pernah** dikirim ke server manapun

## Demo

![image alt](https://github.com/jhontravoltaa76-lab/instagram-unfollower-checker/blob/166c868a9901d620eb954b09e7cd73779d21c640/public/Tampilan%20Web%20RavynSmith-Analyze.png)

## Instalasi (Menjalankan Secara Lokal)

Tidak perlu instalasi apa pun — cukup buka file HTML di browser:

```bash
git clone https://github.com/username/insta-analyze.git
cd insta-analyze
# buka index.html langsung di browser, atau jalankan local server:
python3 -m http.server 8000
```

**Atau langsung akses web nya saja** 
```
https://jhontravoltaa76-lab.github.io/instagram-unfollower-checker/
```

## Cara Menggunakan

1. Buka Instagram Anda
2. Masuk ke **Pengaturan dan Aktivitas → Informasi dan Izin Anda → Ekspor Informasi Anda → Buat Ekspor → Ekspor ke Perangkat**
3. Saran saya untuk menyesuaikan informasi karena kita hanya memerlukan data pengikut dan mengikuti saja **Klik Sesuaikan Informasi → Uncentang semua kecuali Pengikut dan Mengikuti dibagian Koneksi** lalu simpan
4. Pilih rentang waktu sesuai kebutuhan, saran saya untuk pilih sepanjang waktu **Klik Rentang Waktu → Pilih Sepanjang Waktu** lalu simpan
5. Pilih format **JSON** lalu simpan
6. Klik Mulai Ekspor
7. Tunggu Instagram memproses dan nanti akan ada notifikasi (biasanya via email dalam beberapa menit hingga jam), unduh dan ekstrak file ZIP-nya
8. Cari file berikut di dalam folder `connections/followers_and_following/`:
   - `followers_1.json`
   - `following.json`
9. Buka **RavynSmith-Analyze**, lalu upload kedua file tersebut
10. Hasil analisis akan langsung keluar 


## Kontribusi

Kontribusi, laporan bug, dan saran fitur sangat diterima!
1. Fork repository ini
2. Buat branch baru (`git checkout -b fitur-baru`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buka Pull Request
