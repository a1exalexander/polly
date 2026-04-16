import { getAllPosts } from '@/utils/mdx';
import { PostCard } from '@/components';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Updates | Polly',
    description: 'Latest updates and improvements to Polly — the real-time planning poker app for agile teams.',
    robots: {
        index: true,
        follow: true,
    },
};

export default function UpdatesPage() {
    const posts = getAllPosts();

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.header}>
                    <Link href="/start" className={styles.backLink}>
                        <FiArrowLeft />
                        <span>Home</span>
                    </Link>
                    <h1 className={styles.heading}>Updates</h1>
                    <p className={styles.subtitle}>What&apos;s new in Polly</p>
                </div>
                {posts.length > 0 ? (
                    <div className={styles.postsList}>
                        {posts.map((post) => (
                            <PostCard
                                key={post.slug}
                                title={post.title}
                                date={post.date}
                                description={post.description}
                                slug={post.slug}
                            />
                        ))}
                    </div>
                ) : (
                    <p className={styles.empty}>No updates yet. Check back soon!</p>
                )}
            </main>
            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} Polly &ndash; Planning Poker for Agile Teams</p>
            </footer>
        </div>
    );
}
