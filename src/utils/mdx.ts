import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostMeta {
    title: string;
    date: string;
    description: string;
    slug: string;
}

export interface Post extends PostMeta {
    content: string;
}

const POSTS_DIR = path.join(process.cwd(), 'src/content/updates');

export function getPostBySlug(slug: string): Post | null {
    const filePath = path.join(POSTS_DIR, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
        title: data.title,
        date: data.date,
        description: data.description,
        slug: data.slug || slug,
        content,
    };
}

export function getAllPosts(): PostMeta[] {
    if (!fs.existsSync(POSTS_DIR)) {
        return [];
    }

    const files = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith('.mdx'));

    const posts = files.map((file) => {
        const slug = file.replace(/\.mdx$/, '');
        const filePath = path.join(POSTS_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent);

        return {
            title: data.title,
            date: data.date,
            description: data.description,
            slug: data.slug || slug,
        };
    });

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
