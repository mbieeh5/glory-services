import styled from 'styled-components';
import Page from 'components/Page';
import RichText from 'components/RichText';

export default function ContactPage() {
  return (
    <Page title="Cookies policy">
      <CookiesPolicyContainer>
        <RichText>
          <p>
          Selamat datang di rraf project. Kebijakan Cookie ini menjelaskan bagaimana kami menggunakan cookie dan teknologi serupa lainnya saat Anda mengakses atau menggunakan situs web kami. Dengan mengakses atau menggunakan situs web kami, Anda setuju untuk tunduk pada Kebijakan Cookie ini.
          </p>
          <br />
          <strong>
          1. Apa itu Cookie?
          </strong>
          <ul>
            <li>
            Cookie adalah file kecil yang disimpan di perangkat Anda saat Anda mengunjungi situs web. Cookie dapat mengandung informasi seperti preferensi pengguna, data analitik, dan informasi lainnya yang membantu meningkatkan pengalaman pengguna.
            </li>
          </ul>
          <br />
          <strong>
          2. Jenis Cookie yang Kami Gunakan
          </strong>
          <ul>
            <li>
            Kami menggunakan beberapa jenis cookie, termasuk:
            </li>
            <li>Cookie yang diperlukan: Cookie ini penting untuk menjalankan situs web kami dan memungkinkan Anda untuk mengakses fitur-fitur utama.</li>
            <li>Cookie Analitik: Cookie ini digunakan untuk mengumpulkan informasi tentang cara Anda menggunakan situs web kami, termasuk halaman yang Anda kunjungi dan waktu yang Anda habiskan di situs web tersebut. Informasi ini digunakan untuk analisis dan perbaikan.</li>
            <li>Cookie Fungsionalitas: Cookie ini memungkinkan situs web kami untuk mengingat pilihan Anda, seperti bahasa atau wilayah Anda, untuk memberikan pengalaman yang lebih personal.</li>
            <li>Cookie Pihak Ketiga: Kami juga dapat menggunakan cookie pihak ketiga, seperti Google Analytics, untuk mengumpulkan data analitik tambahan tentang penggunaan situs web kami.</li>
          </ul>
          <br />
          <strong>
          3. Bagaimana Anda Bisa Mengelola Cookie
          </strong>
          <ul>
            <li>
            Anda dapat mengelola pengaturan cookie di perangkat Anda melalui pengaturan browser Anda. Anda dapat menghapus cookie yang ada dan mengatur pengaturan untuk menerima atau menolak cookie baru. Harap diperhatikan bahwa menonaktifkan cookie dapat memengaruhi beberapa fitur situs web kami.
            </li>
          </ul>
          <br />
          <strong>
          4. Perubahan pada Kebijakan Cookie
          </strong>
          <ul>
            <li>
            Kami dapat memperbarui Kebijakan Cookie ini dari waktu ke waktu. Perubahan tersebut akan berlaku saat kami memposting versi yang diperbarui di situs web kami.</li>
          </ul>
          <br />
          <strong>
          5. Hubungi Kami
          </strong>
          <ul>
            <li>
            Jika Anda memiliki pertanyaan atau komentar tentang Kebijakan Cookie ini, silakan hubungi kami di rrap5@outlook.com .</li>
          </ul>

  
        </RichText>
      </CookiesPolicyContainer>
    </Page>
  );
}

const CookiesPolicyContainer = styled.div`
  max-width: 90rem;
  margin: auto;
  overflow-x: auto;
`;
