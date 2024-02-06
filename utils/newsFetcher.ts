import axios from 'axios';
import { NewsArticle } from 'types';

export async function getSingleNews(categorys: string = "terbaru"): Promise<NewsArticle[]> {
    let berita: NewsArticle[] = [];
    try {
        const response = await axios.get(`https://api-berita-indonesia.vercel.app/sindonews/${categorys}/`);
        berita = response.data.data.posts;
    } catch (error) {
        throw error;
    }

    return berita;
}
