import { type F_Article } from "@/types/article-types"

export default function ArticleComponent({ article }: { article: F_Article} ) {
  return <a href={""} className="article-container">
    <div className="image-container">
      <img className="article-image" src={article.image} />

    </div>
    <section className="article-information-container">
      <h3>{article.title}</h3>
      <p>{article.artiste} - {article.date}</p>
    </section>
  </a>
}

