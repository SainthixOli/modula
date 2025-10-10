import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnamnesisField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date";
  options?: string[];
  required: boolean;
}

interface AnamnesisTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: AnamnesisField[];
  createdAt: string;
}

export default function AnamnesiTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<AnamnesisTemplate[]>([
    {
      id: "1",
      name: "Anamnese Geral",
      description: "Template padrão para primeira consulta",
      category: "Geral",
      fields: [
        { id: "f1", label: "Motivo da consulta", type: "textarea", required: true },
        { id: "f2", label: "História da doença atual", type: "textarea", required: true },
        { id: "f3", label: "Antecedentes pessoais", type: "textarea", required: false },
      ],
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Anamnese Psicológica",
      description: "Template para avaliação psicológica inicial",
      category: "Psicologia",
      fields: [
        { id: "f1", label: "Queixa principal", type: "textarea", required: true },
        { id: "f2", label: "História familiar", type: "textarea", required: true },
        { id: "f3", label: "Humor atual", type: "select", options: ["Estável", "Ansioso", "Deprimido", "Eufórico"], required: true },
      ],
      createdAt: "2024-02-20",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AnamnesisTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [fields, setFields] = useState<AnamnesisField[]>([]);

  const handleCreateTemplate = () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newTemplate: AnamnesisTemplate = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      fields: fields,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTemplates([...templates, newTemplate]);
    setIsDialogOpen(false);
    resetForm();
    toast({
      title: "Sucesso",
      description: "Template criado com sucesso",
    });
  };

  const handleEditTemplate = () => {
    if (!editingTemplate) return;

    setTemplates(
      templates.map((t) =>
        t.id === editingTemplate.id
          ? { ...editingTemplate, name: formData.name, description: formData.description, category: formData.category, fields: fields }
          : t
      )
    );
    setIsDialogOpen(false);
    setEditingTemplate(null);
    resetForm();
    toast({
      title: "Sucesso",
      description: "Template atualizado com sucesso",
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
    toast({
      title: "Sucesso",
      description: "Template excluído com sucesso",
    });
  };

  const handleDuplicateTemplate = (template: AnamnesisTemplate) => {
    const newTemplate: AnamnesisTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Cópia)`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTemplates([...templates, newTemplate]);
    toast({
      title: "Sucesso",
      description: "Template duplicado com sucesso",
    });
  };

  const openEditDialog = (template: AnamnesisTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
    });
    setFields(template.fields);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", category: "" });
    setFields([]);
    setEditingTemplate(null);
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `f${fields.length + 1}`,
        label: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<AnamnesisField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />

      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Templates de Anamnese</h1>
              <p className="text-muted-foreground">Gerencie seus templates de anamnese</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? "Editar Template" : "Novo Template"}
                  </DialogTitle>
                  <DialogDescription>
                    Crie ou edite um template de anamnese personalizado
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Template *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Anamnese Psicológica"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Geral">Geral</SelectItem>
                        <SelectItem value="Psicologia">Psicologia</SelectItem>
                        <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
                        <SelectItem value="Nutrição">Nutrição</SelectItem>
                        <SelectItem value="Pediatria">Pediatria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva o propósito deste template"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label>Campos do Formulário</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addField}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Campo
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <Card key={field.id}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Campo {index + 1}</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeField(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <Input
                              placeholder="Rótulo do campo"
                              value={field.label}
                              onChange={(e) => updateField(index, { label: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <Select
                                value={field.type}
                                onValueChange={(value: any) => updateField(index, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Texto curto</SelectItem>
                                  <SelectItem value="textarea">Texto longo</SelectItem>
                                  <SelectItem value="select">Lista de opções</SelectItem>
                                  <SelectItem value="checkbox">Checkbox</SelectItem>
                                  <SelectItem value="date">Data</SelectItem>
                                </SelectContent>
                              </Select>

                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`required-${index}`}
                                  checked={field.required}
                                  onChange={(e) => updateField(index, { required: e.target.checked })}
                                  className="rounded"
                                />
                                <Label htmlFor={`required-${index}`}>Obrigatório</Label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum campo adicionado. Clique em "Adicionar Campo" para começar.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={editingTemplate ? handleEditTemplate : handleCreateTemplate}>
                    {editingTemplate ? "Salvar Alterações" : "Criar Template"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {template.fields.length} campos • Criado em {new Date(template.createdAt).toLocaleDateString("pt-BR")}
                  </p>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
