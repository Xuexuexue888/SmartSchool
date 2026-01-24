import React, { useMemo, useState } from "react";
import {
  Search,
  Download,
  Star,
  FileText,
  Book,
  GraduationCap,
  UploadCloud,
  ArrowUpRight,
} from "lucide-react";
import { Resource } from "../types";
import { useResourceStore, toggleBookmark, addRecent } from "../services/resourceStore";

// 扩展类型（不改全局 types）
type ResourceItem = Resource & {
  category: "课堂笔记" | "历年考卷" | "学术书籍";
  updatedAt: string;
  tags?: string[];
};

const resources: ResourceItem[] = [
  {
    id: "1",
    title: "《高等数学》复习精要及常考题型",
    author: "学霸张",
    type: "Note",
    rating: 4.9,
    downloads: 1250,
    category: "课堂笔记",
    updatedAt: "2026-01-10",
    tags: ["高数", "期末", "重点"],
  },
  {
    id: "2",
    title: "计算机网络 2024 期末试卷 (带答案)",
    author: "网安社团",
    type: "Exam",
    rating: 4.7,
    downloads: 890,
    category: "历年考卷",
    updatedAt: "2026-01-15",
    tags: ["计网", "真题", "答案"],
  },
  {
    id: "3",
    title: "Python 科学计算实战讲义",
    author: "李教授",
    type: "Slide",
    rating: 4.5,
    downloads: 420,
    category: "课堂笔记",
    updatedAt: "2025-12-25",
    tags: ["Python", "科学计算", "讲义"],
  },
  {
    id: "4",
    title: "心理学概论 深度阅读建议",
    author: "心理协会",
    type: "Book",
    rating: 4.8,
    downloads: 150,
    category: "学术书籍",
    updatedAt: "2025-12-02",
    tags: ["心理学", "阅读", "书单"],
  },
];

const aiPick: ResourceItem = {
  id: "ai-pick-ds-2024",
  title: "2024春季数据结构必考点全覆盖",
  author: "校级金奖获得者",
  type: "Note",
  rating: 4.9,
  downloads: 9999,
  category: "课堂笔记",
  updatedAt: "2026-01-20",
  tags: ["数据结构", "二叉搜索树", "必考", "代码"],
};

type ViewMode = "all" | "bookmarks" | "recents";
type SortMode = "downloads" | "rating" | "newest";

const ResourceSharing: React.FC = () => {
  // ✅ 方案B：直接从 store 读（自动刷新）
  const { bookmarks, recents } = useResourceStore();

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<
    "全部资料" | "课堂笔记" | "历年考卷" | "学术书籍"
  >("全部资料");
  const [sortMode, setSortMode] = useState<SortMode>("downloads");

  const recentOrder = useMemo(() => {
    return new Map(recents.map((x, idx) => [x.id, idx]));
  }, [recents]);

  const allResources = useMemo(() => [aiPick, ...resources], []);

  const visibleResources = useMemo(() => {
    const bookmarkSet = new Set(bookmarks);
    let list = allResources;

    if (viewMode === "bookmarks") {
      list = list.filter((r) => bookmarkSet.has(r.id));
    } else if (viewMode === "recents") {
      list = list.filter((r) => recentOrder.has(r.id));
    }

    if (category !== "全部资料") {
      list = list.filter((r) => r.category === category);
    }

    const kw = keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter((r) => {
        const hay = `${r.title ?? ""} ${r.author ?? ""} ${(r.tags ?? []).join(" ")}`.toLowerCase();
        return hay.includes(kw);
      });
    }

    if (viewMode === "recents") {
      list = [...list].sort(
        (a, b) => (recentOrder.get(a.id) ?? 9999) - (recentOrder.get(b.id) ?? 9999)
      );
    } else {
      list = [...list].sort((a, b) => {
        if (sortMode === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        if (sortMode === "newest") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        return (b.downloads ?? 0) - (a.downloads ?? 0);
      });
    }

    return list;
  }, [allResources, bookmarks, recents, recentOrder, viewMode, category, keyword, sortMode]);

  const listTitle =
    viewMode === "bookmarks"
      ? "我的收藏"
      : viewMode === "recents"
      ? "最近浏览"
      : sortMode === "downloads"
      ? "热门下载"
      : sortMode === "rating"
      ? "高评分"
      : "最新上传";

  function onToggleBookmark(id: string) {
    toggleBookmark(id);
  }

  function markRecent(id: string) {
    addRecent(id);
  }

  function iconByType(type: ResourceItem["type"]) {
    if (type === "Note") return <FileText size={20} />;
    if (type === "Exam") return <GraduationCap size={20} />;
    return <Book size={20} />;
  }

  const tags = ["全部资料", "课堂笔记", "历年考卷", "学术书籍"] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <header>
          <h2 className="text-2xl font-bold text-slate-800">资源共享平台</h2>
          <p className="text-slate-500">发现、分享并学习来自全校同学的智慧。</p>
        </header>

        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-md">
          <UploadCloud size={20} />
          <span>上传我的资源</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索课程名称、资料关键字、老师名字..."
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
              viewMode === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-100"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setViewMode("bookmarks")}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
              viewMode === "bookmarks"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-100"
            }`}
          >
            ⭐ 收藏（{bookmarks.length}）
          </button>
          <button
            onClick={() => setViewMode("recents")}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
              viewMode === "recents"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-100"
            }`}
          >
            🕘 最近
          </button>
        </div>

        <div className="md:ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">排序</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="bg-white border border-slate-100 rounded-xl px-3 py-2 text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="downloads">按热度（下载量）</option>
            <option value="rating">按评分</option>
            <option value="newest">按最新</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setCategory(tag)}
            className={`py-3 rounded-2xl font-semibold text-sm transition-all ${
              category === tag
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-slate-600 border border-slate-100"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-50">
          <div className="p-8 border-r border-slate-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-indigo-600 uppercase tracking-widest text-[10px] font-bold">
                <Star size={14} />
                <span>今日 AI 强烈推荐</span>
              </div>

              <button
                onClick={() => onToggleBookmark(aiPick.id)}
                className="w-10 h-10 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center justify-center"
                title={bookmarks.includes(aiPick.id) ? "取消收藏" : "收藏"}
              >
                <Star
                  size={18}
                  className={
                    bookmarks.includes(aiPick.id)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-slate-400"
                  }
                />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">{aiPick.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              根据您的学习记录，您最近正在学习“二叉搜索树”。这份资料由校级金奖获得者整理，涵盖了二叉树所有可能的考点和实战代码。
            </p>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => markRecent(aiPick.id)}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 hover:bg-slate-800 transition-colors"
              >
                <Download size={16} />
                <span>立即下载</span>
              </button>
              <button
                onClick={() => markRecent(aiPick.id)}
                className="text-indigo-600 text-sm font-bold hover:underline"
              >
                预览全文
              </button>
            </div>
          </div>

          <div className="p-8 bg-slate-50/30 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <p className="text-xl font-bold text-indigo-600">4,200+</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">总资源</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <p className="text-xl font-bold text-green-600">1.2W+</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">下载量</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <p className="text-xl font-bold text-orange-600">98%</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">好评率</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <p className="text-xl font-bold text-purple-600">850+</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">今日新增</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">{listTitle}</h3>

            <button
              onClick={() => {
                setViewMode("all");
                setCategory("全部资料");
                setKeyword("");
                setSortMode("downloads");
              }}
              className="text-indigo-600 text-xs font-bold hover:underline flex items-center"
            >
              重置筛选 <ArrowUpRight size={14} className="ml-1" />
            </button>
          </div>

          {visibleResources.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <p className="font-semibold mb-2">暂无内容</p>
              <p className="text-sm">试试切换分类/清空搜索，或先去浏览一些资源。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleResources.map((res) => {
                const marked = bookmarks.includes(res.id);
                return (
                  <div
                    key={res.id}
                    className="group p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all relative"
                    onClick={() => markRecent(res.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(res.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center justify-center"
                      title={marked ? "取消收藏" : "收藏"}
                    >
                      <Star
                        size={16}
                        className={marked ? "text-yellow-500 fill-yellow-500" : "text-slate-400"}
                      />
                    </button>

                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {iconByType(res.type as any)}
                    </div>

                    <div className="text-[10px] inline-flex px-2 py-1 rounded-full bg-slate-50 text-slate-500 font-bold mb-2">
                      {res.category}
                    </div>

                    <h4 className="font-bold text-sm text-slate-800 line-clamp-2 min-h-[2.5rem] mb-2">
                      {res.title}
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">By {res.author}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-slate-600">{res.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {res.downloads} 下载
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markRecent(res.id);
                        }}
                        className="text-indigo-600 text-xs font-bold hover:underline"
                      >
                        预览
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markRecent(res.id);
                        }}
                        className="text-slate-700 text-xs font-bold hover:underline flex items-center"
                      >
                        <Download size={14} className="mr-1" /> 下载
                      </button>
                    </div>

                    {recentOrder.has(res.id) && (
                      <div className="mt-2 text-[10px] text-slate-400">
                        最近浏览：第 {recentOrder.get(res.id)! + 1} 条
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceSharing;
