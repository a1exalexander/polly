import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import styles from './MdxContent.module.css';
import { ComponentPropsWithoutRef } from 'react';

const components = {
    h1: (props: ComponentPropsWithoutRef<'h1'>) => <h1 className={styles.h1} {...props} />,
    h2: (props: ComponentPropsWithoutRef<'h2'>) => <h2 className={styles.h2} {...props} />,
    h3: (props: ComponentPropsWithoutRef<'h3'>) => <h3 className={styles.h3} {...props} />,
    p: (props: ComponentPropsWithoutRef<'p'>) => <p className={styles.p} {...props} />,
    ul: (props: ComponentPropsWithoutRef<'ul'>) => <ul className={styles.ul} {...props} />,
    ol: (props: ComponentPropsWithoutRef<'ol'>) => <ol className={styles.ol} {...props} />,
    li: (props: ComponentPropsWithoutRef<'li'>) => <li className={styles.li} {...props} />,
    a: (props: ComponentPropsWithoutRef<'a'>) => <a className={styles.a} {...props} />,
    code: (props: ComponentPropsWithoutRef<'code'>) => <code className={styles.code} {...props} />,
    pre: (props: ComponentPropsWithoutRef<'pre'>) => <pre className={styles.pre} {...props} />,
    blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => <blockquote className={styles.blockquote} {...props} />,
    hr: (props: ComponentPropsWithoutRef<'hr'>) => <hr className={styles.hr} {...props} />,
    strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong className={styles.strong} {...props} />,
    img: (props: ComponentPropsWithoutRef<'img'>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.img} alt="" {...props} />
    ),
};

interface MdxContentProps {
    source: string;
}

export async function MdxContent({ source }: MdxContentProps) {
    const { default: MDXContent } = await evaluate(source, {
        ...runtime,
        remarkPlugins: [remarkGfm],
    });

    return (
        <article className={styles.article}>
            <MDXContent components={components} />
        </article>
    );
}
