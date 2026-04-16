import { getPostBySlug, getAllPosts } from '@/utils/mdx';
import { MdxContent } from '@/components';
import { format } from 'date-fns';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import styles from './page.module.css';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return { title: 'Not Found | Polly' };
    }

    return {
        title: `${post.title} | Polly Updates`,
        description: post.description,
    };
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export default async function UpdatePostPage({ params }: Props) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <Link href="/updates" className={styles.backLink}>
                    <FiArrowLeft />
                    <span>All Updates</span>
                </Link>
                <header className={styles.postHeader}>
                    <time className={styles.date} dateTime={post.date}>
                        {format(new Date(post.date), 'MMMM d, yyyy')}
                    </time>
                    <h1 className={styles.title}>{post.title}</h1>
                </header>
                <MdxContent source={post.content} />
            </main>
            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} Polly &ndash; Planning Poker for Agile Teams</p>
            </footer>
        </div>
    );
}
