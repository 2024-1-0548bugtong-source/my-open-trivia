import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useLocation } from "wouter";

interface TriviaQuestion { 
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<TriviaQuestion[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<number[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('trivia_favorites') || '[]');
    setFavorites(stored);

    const storedCats = JSON.parse(localStorage.getItem('fav_categories') || '[]');
    setFavoriteCategories(storedCats);

    // fetch category map to display names for favorite categories
    (async () => {
      try {
        const res = await axios.get('https://opentdb.com/api_category.php');
        const map: Record<number, string> = {};
        res.data.trivia_categories.forEach((c: any) => (map[c.id] = c.name));
        setCategoryMap(map);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const removeFavorite = (questionText: string) => {
    const updated = favorites.filter(q => q.question !== questionText);
    setFavorites(updated);
    localStorage.setItem('trivia_favorites', JSON.stringify(updated));
    toast({ description: "Removed from favorites" });
  };

  const removeCategoryFavorite = (catId: number) => {
    const updated = favoriteCategories.filter((id) => id !== catId);
    setFavoriteCategories(updated);
    localStorage.setItem('fav_categories', JSON.stringify(updated));
    toast({ description: 'Category removed from favorites' });
  };

  const openCategory = (catId: number) => {
    // navigate to categories page and open config for this category
    setLocation(`/categories?cat=${catId}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
          Your Favorites
        </h1>
            <p className="text-muted-foreground">
              Questions & Categories you've saved. {favorites.length} question(s), {favoriteCategories.length} category(s).
            </p>
      </div>
          {/* Show favorite categories first if present */}
          {favoriteCategories.length > 0 && (
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {favoriteCategories.map((id) => (
                <Card key={`cat-${id}`} className="group relative overflow-hidden border-l-4 border-l-primary/50">
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{categoryMap[id] ?? `Category ${id}`}</h3>
                      <p className="text-sm text-muted-foreground">ID: {id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => openCategory(id)} variant="ghost" size="sm">Open</Button>
                      <Button onClick={() => removeCategoryFavorite(id)} variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {favorites.length === 0 ? (
        <Card className="bg-muted/30 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="bg-background p-4 rounded-full shadow-sm">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No favorites yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Start playing and star questions you want to review later. They will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {favorites.map((q, idx) => (
            <Card key={idx} className="group relative overflow-hidden border-l-4 border-l-primary/50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <Badge variant="secondary">{q.category}</Badge>
                       <Badge variant="outline" className="uppercase text-[10px]">{q.difficulty}</Badge>
                    </div>
                    <h3 
                      className="text-lg font-medium leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: q.question }} 
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => removeFavorite(q.question)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                    <span className="text-xs uppercase text-muted-foreground">Answer:</span>
                    <span dangerouslySetInnerHTML={{ __html: q.correct_answer }} />
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
