"use client";

import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/default-layout";
import FilterBar from "@/components/filter-bar";
import SidebarCard, {
  SidebarCardHeader,
  SidebarCardTags,
} from "@/components/fixed-sidebar";

export default function ExamplePage() {
  const searchParams = useSearchParams();
  const activeSort = searchParams.get("sort") || "foryou";

  // Sample categories
  const categories = [
    "Przedsiębiorczość",
    "Rozwój",
    "LGBT",
    "Mieszkalnictwo",
    "Socjale",
    "Socjaleasd",
    "Rekreacja",
    "Imigracja",
    "Polski",
  ];

  // Sample posts data
  const posts = [
    {
      id: 1,
      author: "Donald Tusk",
      authorImage: "/api/placeholder/32/32",
      content: "Wciąż jednak bardziej przekonuje mnie obecny bardziej",
      subtext: "Wypełnienie społeczeństwa stróg za rząd więzienne",
      likes: 145,
      comments: 32,
      timestamp: "21:35",
    },
    {
      id: 2,
      author: "Andrzej Duda",
      authorImage: "/api/placeholder/32/32",
      content:
        "Zrób proszę. Ja sam generuję te fotki i wiem, że czasem mogą być zdjebane",
      subtext: "Wypełnienie społeczeństwa stróg za rząd więzienne",
      likes: 89,
      comments: 15,
      timestamp: "20:42",
    },
    {
      id: 2,
      author: "Andrzej Duda",
      authorImage: "/api/placeholder/32/32",
      content:
        "Zrób proszę. Ja sam generuję te fotki i wiem, że czasem mogą być zdjebane",
      subtext: "Wypełnienie społeczeństwa stróg za rząd więzienne",
      likes: 89,
      comments: 15,
      timestamp: "20:42",
    },
    {
      id: 2,
      author: "Andrzej Duda",
      authorImage: "/api/placeholder/32/32",
      content:
        "Zrób proszę. Ja sam generuję te fotki i wiem, że czasem mogą być zdjebane",
      subtext: "Wypełnienie społeczeństwa stróg za rząd więzienne",
      likes: 89,
      comments: 15,
      timestamp: "20:42",
    },
    {
      id: 2,
      author: "Andrzej Duda",
      authorImage: "/api/placeholder/32/32",
      content:
        "Zrób proszę. Ja sam generuję te fotki i wiem, że czasem mogą być zdjebane",
      subtext: "Wypełnienie społeczeństwa stróg za rząd więzienne",
      likes: 89,
      comments: 15,
      timestamp: "20:42",
    },
    {
      id: 2,
      author: "Andrzej Duda",
      authorImage: "/api/placeholder/32/32",
      content:
        "Zrób proszę. Ja sam generuję te fotki i wiem, że czasem mogą być zdjebane",
      subtext: "Wypełnienie społeczeństwa stróg za rząd więzienne",
      likes: 89,
      comments: 15,
      timestamp: "20:42",
    },
    {
      id: 2,
      author: "Andrzej Duda",
      authorImage: "/api/placeholder/32/32",
      content:
        "Zrób proszę. Ja sam generuję te fotki i wiem, że czasem mogą być zdjebane",
      subtext: "Wypełnienie społeczeństwa stróg za rząd więzienne",
      likes: 89,
      comments: 15,
      timestamp: "20:42",
    },
    {
      id: 2,
      author: "Andrzej Duda",
      authorImage: "/api/placeholder/32/32",
      content:
        "Zrób proszę. Ja sam generuję te fotki i wiem, że czasem mogą być zdjebane",
      subtext: "Wypełnienie społeczeństwa stróg za rząd więzienne",
      likes: 89,
      comments: 15,
      timestamp: "20:42",
    },
    {
      id: 2,
      author: "Andrzej Duda",
      authorImage: "/api/placeholder/32/32",
      content:
        "Zrób proszę. Ja sam generuję te fotki i wiem, że czasem mogą być zdjebane",
      subtext: "Wypełnienie społeczeństwa stróg za rząd więzienne",
      likes: 89,
      comments: 15,
      timestamp: "20:42",
    },
  ];

  return (
    <PageLayout
      filterBar={
        <div className="px-4 py-2">
          <FilterBar categories={categories} activeSort={activeSort} />
        </div>
      }
      sidebar={
        <div className="space-y-4">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Magni
          consectetur dolorum earum dicta ipsam ea eligendi. Earum molestiae
          cumque vel sapiente eum facilis. Repellat odio ad quo, quisquam nemo
          dolore! Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio
          quasi modi aliquam consequuntur sint sit officiis, exercitationem
          quia. Nemo, magni delectus. Saepe aspernatur, veritatis explicabo
          ipsam ipsa sint expedita accusantium. Lorem ipsum, dolor sit amet
          consectetur adipisicing elit. Iure minus cumque quos magni distinctio
          illo nulla soluta cupiditate inventore ex quaerat asperiores eaque,
          sunt rerum. Consequatur obcaecati fuga eum saepe?
          <SidebarCard>
            <SidebarCardHeader
              title="Poznaj Sejmotłi"
              actionLabel="Zaloguj się"
              onAction={() => console.log("Login clicked")}
            />
            <SidebarCardTags
              tags={categories}
              onTagClick={(tag) => console.log("Tag clicked:", tag)}
            />
          </SidebarCard>
          <SidebarCard>
            <SidebarCardHeader
              title="Najbliższe obrady sejmu"
              actionLabel="Zobacz więcej"
              onAction={() => console.log("See more clicked")}
            />
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="Donald Tusk" />
                  <AvatarFallback>DT</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Donald Tusk</p>
                  <p className="text-sm text-muted-foreground">
                    Przydałby się jakiś tekst
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src="/api/placeholder/32/32"
                    alt="Andrzej Duda"
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Andrzej Duda</p>
                  <p className="text-sm text-muted-foreground">
                    Ma 40% Frekwencję na Posiedzeniach
                  </p>
                </div>
              </div>
            </div>
          </SidebarCard>
        </div>
      }
      content={
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.authorImage} alt={post.author} />
                  <AvatarFallback>
                    {post.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{post.author}</h3>
                    <span className="text-sm text-muted-foreground">
                      {post.timestamp}
                    </span>
                  </div>
                  <p className="mt-1">{post.content}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {post.subtext}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="text-sm text-muted-foreground hover:text-foreground">
                      ❤️ {post.likes}
                    </button>
                    <button className="text-sm text-muted-foreground hover:text-foreground">
                      💬 {post.comments}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    />
  );
}
