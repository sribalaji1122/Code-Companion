import { useForm } from "react-hook-form"; 

import { zodResolver } from "@hookform/resolvers/zod"; 

import { z } from "zod"; 

import { companyContextSchema } from "@shared/schema"; 

import { useGenerateArchitecture } from "@/hooks/use-architecture"; 

 

import { 

  Form, 

  FormControl, 

  FormField, 

  FormItem, 

  FormLabel, 

  FormMessage, 

} from "@/components/ui/form"; 

 

import { Input } from "@/components/ui/input"; 

import { Button } from "@/components/ui/button"; 

import { 

  Select, 

  SelectContent, 

  SelectItem, 

  SelectTrigger, 

  SelectValue, 

} from "@/components/ui/select"; 

import { Checkbox } from "@/components/ui/checkbox"; 

import { Card } from "@/components/ui/card"; 

import { Loader2, Sparkles } from "lucide-react"; 

 

type FormValues = z.infer<typeof companyContextSchema>; 

 

export default function InputForm() { 

  const { mutate, isPending } = useGenerateArchitecture(); 

 

  const form = useForm<FormValues>({ 

    resolver: zodResolver(companyContextSchema), 

    defaultValues: { 

      companyName: "", 

      industry: "", 

      businessModel: "B2B", 

      region: "", 

      dataSources: [], 

      toolsUsed: { 

        crm: "", 

        marketingAutomation: "", 

        cms: "", 

        cdp: "", 

        analytics: "", 

        dataWarehouse: "", 

        personalization: "", 

      }, 

      activationChannels: [], 

      dataSourceConnections: [], 

      activationConnections: [], 

      currentlyUsingUseCases: [], 

      currentUseCases: "", 

      expectedOutcomes: "", 

    }, 

  }); 

 

  const onSubmit = (data: FormValues) => mutate(data); 

 

  const selectedTools = Object.values(form.watch("toolsUsed") || {}).filter( 

    (v) => v && v !== "None" 

  ); 

 

  /* ================= DATA ================= */ 

 

  const dataSources = [ 

    "Website Events", 

    "Mobile App Events", 

    "POS Transactions", 

    "CRM Interactions", 

    "Call Center Logs", 

    "Email Engagement", 

    "ERP System", 

    "API Integrations", 

  ]; 

 

  const activationChannels = [ 

    "Email", 

    "SMS", 

    "Push Notifications", 

    "WhatsApp", 

    "Paid Media", 

    "Direct Mail", 

  ]; 

 

  return ( 

    <div className="min-h-screen pt-24 pb-16 px-4 bg-slate-50"> 

      <div className="max-w-6xl mx-auto space-y-12"> 

 

        {/* HERO */} 

        <div className="text-center space-y-4"> 

          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"> 

            Architect Your Growth 

          </h1> 

          <p className="text-muted-foreground max-w-2xl mx-auto"> 

            Configure your current ecosystem and generate your maturity model. 

          </p> 

        </div> 

 

        <Card className="p-10 shadow-xl space-y-12"> 

          <Form {...form}> 

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12"> 

 

              {/* ================= COMPANY CONTEXT ================= */} 

              <Section title="Company Context"> 

                <Grid> 

                  <TextField name="companyName" label="Company Name" form={form} /> 

                  <TextField name="industry" label="Industry" form={form} /> 

                  <RegionDropdown form={form} /> 

                  <SelectField 

                    name="businessModel" 

                    label="Business Model" 

                    options={["B2B", "B2C", "Hybrid"]} 

                    form={form} 

                  /> 

                </Grid> 

              </Section> 

 

              {/* ================= DATA SOURCES ================= */} 

              <Section title="Data Sources"> 

                <CheckboxGroup 

                  name="dataSources" 

                  options={dataSources} 

                  form={form} 

                /> 

              </Section> 

 

              {/* ================= TECH STACK ================= */} 

              <Section title="Current Tech Stack"> 

                <Grid> 

                  <SelectField 

                    name="toolsUsed.crm" 

                    label="CRM" 

                    options={["Zoho","HubSpot","Salesforce","MS Dynamics","Other","None"]} 

                    form={form} 

                  /> 

                  <SelectField 

                    name="toolsUsed.marketingAutomation" 

                    label="Marketing Automation" 

                    options={["Zoho","HubSpot","SFMC","Adobe","Marketo","Other","None"]} 

                    form={form} 

                  /> 

                  <SelectField 

                    name="toolsUsed.cms" 

                    label="CMS" 

                    options={["WordPress","Drupal","AEM","Other","None"]} 

                    form={form} 

                  /> 

                  <SelectField 

                    name="toolsUsed.cdp" 

                    label="CDP" 

                    options={["Segment","Tealium","Adobe RT-CDP","Zoho CDP","Other","None"]} 

                    form={form} 

                  /> 

                  <SelectField 

                    name="toolsUsed.analytics" 

                    label="Analytics" 

                    options={["GA4","Adobe Analytics","Other","None"]} 

                    form={form} 

                  /> 

                  <SelectField 

                    name="toolsUsed.dataWarehouse" 

                    label="Data Warehouse / Data Lake" 

                    options={["Snowflake","BigQuery","Redshift","Azure","None"]} 

                    form={form} 

                  /> 

                  <SelectField 

                    name="toolsUsed.personalization" 

                    label="Personalization" 

                    options={["Dynamic Yield","Adobe Target","Optimizely","None"]} 

                    form={form} 

                  /> 

                </Grid> 

              </Section> 

 

              {/* ================= ACTIVATION ================= */} 

              <Section title="Activation Channels"> 

                <CheckboxGroup 

                  name="activationChannels" 

                  options={activationChannels} 

                  form={form} 

                /> 

              </Section> 

 

              {/* ================= DATA SOURCE MAPPING ================= */} 

              {form.watch("dataSources")?.length > 0 && 

                selectedTools.length > 0 && ( 

                  <Section title="Map Data Sources → Tech Stack"> 

                    {form.watch("dataSources")?.map((source) => ( 

                      <MappingRow 

                        key={source} 

                        source={source} 

                        targets={selectedTools} 

                        form={form} 

                        fieldName="dataSourceConnections" 

                      /> 

                    ))} 

                  </Section> 

                )} 

 

              {/* ================= ACTIVATION MAPPING ================= */} 

              {selectedTools.length > 0 && 

                form.watch("activationChannels")?.length > 0 && ( 

                  <Section title="Map Tech Stack → Activation Channels"> 

                    {selectedTools.map((tool) => ( 

                      <MappingRow 

                        key={tool} 

                        source={tool} 

                        targets={form.watch("activationChannels")} 

                        form={form} 

                        fieldName="activationConnections" 

                      /> 

                    ))} 

                  </Section> 

                )} 

               {/* ================= CURRENT USE CASE NAMES ================= */} 

<Section title="Currently Using Use Cases"> 

  <FormField 

    control={form.control} 

    name="currentlyUsingUseCases" 

    render={({ field }) => ( 

      <FormItem> 

        <FormLabel>Enter Current Use Case Names</FormLabel> 

        <FormControl> 

          <Input 

            placeholder="Example: Lead Nurturing, Cart Abandonment, Cross-sell" 

            onChange={(e) => { 

              const values = e.target.value 

                .split(",") 

                .map((v) => v.trim()) 

                .filter(Boolean); 

 

              field.onChange(values); 

            }} 

          /> 

        </FormControl> 

        <FormMessage /> 

        <p className="text-xs text-muted-foreground mt-1"> 

          Separate multiple use cases with commas. 

        </p> 

      </FormItem> 

    )} 

  /> 

</Section> 

 

<Button type="submit" disabled={isPending} className="w-full h-12"></Button>  

 

              <Button type="submit" disabled={isPending} className="w-full h-12"> 

                {isPending ? ( 

                  <> 

                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> 

                    Generating... 

                  </> 

                ) : ( 

                  <> 

                    <Sparkles className="w-4 h-4 mr-2" /> 

                    Generate ARC+ Model 

                  </> 

                )} 

              </Button> 

 

            </form> 

          </Form> 

        </Card> 

      </div> 

    </div> 

  ); 

} 

 

/* ================= REUSABLE COMPONENTS ================= */ 

 

function Section({ title, children }: any) { 

  return ( 

    <section className="space-y-6"> 

      <h2 className="text-xl font-semibold border-b pb-2">{title}</h2> 

      {children} 

    </section> 

  ); 

} 

 

function Grid({ children }: any) { 

  return <div className="grid md:grid-cols-2 gap-6">{children}</div>; 

} 

 

function TextField({ name, label, form }: any) { 

  return ( 

    <FormField 

      control={form.control} 

      name={name} 

      render={({ field }: any) => ( 

        <FormItem> 

          <FormLabel>{label}</FormLabel> 

          <FormControl> 

            <Input {...field} /> 

          </FormControl> 

          <FormMessage /> 

        </FormItem> 

      )} 

    /> 

  ); 

} 

 

function SelectField({ name, label, options, form }: any) { 

  const value = form.watch(name); 

 

  return ( 

    <> 

      <FormField 

        control={form.control} 

        name={name} 

        render={({ field }: any) => ( 

          <FormItem> 

            <FormLabel>{label}</FormLabel> 

            <Select onValueChange={field.onChange} value={field.value}> 

              <FormControl> 

                <SelectTrigger> 

                  <SelectValue placeholder="Select option" /> 

                </SelectTrigger> 

              </FormControl> 

              <SelectContent> 

                {options.map((opt: string) => ( 

                  <SelectItem key={opt} value={opt}> 

                    {opt} 

                  </SelectItem> 

                ))} 

              </SelectContent> 

            </Select> 

          </FormItem> 

        )} 

      /> 

      {value === "Other" && ( 

        <FormItem className="mt-2"> 

          <FormLabel>Specify {label}</FormLabel> 

          <FormControl> 

            <Input 

              placeholder={`Enter ${label}`} 

              onChange={(e) => form.setValue(name, e.target.value)} 

            /> 

          </FormControl> 

        </FormItem> 

      )} 

    </> 

  ); 

} 

 

function CheckboxGroup({ name, options, form }: any) { 

  return ( 

    <div className="grid md:grid-cols-3 gap-4"> 

      {options.map((opt: string) => ( 

        <FormField 

          key={opt} 

          control={form.control} 

          name={name} 

          render={({ field }: any) => ( 

            <FormItem className="flex items-center space-x-2"> 

              <FormControl> 

                <Checkbox 

                  checked={field.value?.includes(opt)} 

                  onCheckedChange={(checked: boolean) => 

                    checked 

                      ? field.onChange([...field.value, opt]) 

                      : field.onChange(field.value?.filter((v: string) => v !== opt)) 

                  } 

                /> 

              </FormControl> 

              <FormLabel>{opt}</FormLabel> 

            </FormItem> 

          )} 

        /> 

      ))} 

    </div> 

  ); 

} 

 

function MappingRow({ source, targets, form, fieldName }: any) { 

  const existing = form.watch(fieldName) || []; 

  const current = 

    existing.find((c: any) => c.source === source) || { source, targets: [] }; 

 

  return ( 

    <div className="flex items-start gap-6"> 

      <div className="w-56 font-medium pt-2">{source}</div> 

      <div className="flex flex-wrap gap-3"> 

        {targets.map((t: string) => { 

          const checked = current.targets.includes(t); 

          return ( 

            <label key={t} className="flex items-center gap-2 text-sm"> 

              <input 

                type="checkbox" 

                checked={checked} 

                onChange={(e) => { 

                  let updatedTargets; 

                  if (e.target.checked) { 

                    updatedTargets = [...current.targets, t]; 

                  } else { 

                    updatedTargets = current.targets.filter((x: string) => x !== t); 

                  } 

                  const updated = [ 

                    ...existing.filter((c: any) => c.source !== source), 

                    { source, targets: updatedTargets }, 

                  ]; 

                  form.setValue(fieldName, updated); 

                }} 

              /> 

              {t} 

            </label> 

          ); 

        })} 

      </div> 

    </div> 

  ); 

} 

 

function RegionDropdown({ form }: any) { 

  return ( 

    <FormField 

      control={form.control} 

      name="region" 

      render={({ field }: any) => ( 

        <FormItem> 

          <FormLabel>Region</FormLabel> 

          <Select onValueChange={field.onChange} value={field.value}> 

            <FormControl> 

              <SelectTrigger> 

                <SelectValue placeholder="Select region" /> 

              </SelectTrigger> 

            </FormControl> 

            <SelectContent> 

              <SelectItem value="India">India</SelectItem> 

              <SelectItem value="USA">USA</SelectItem> 

              <SelectItem value="UK">UK</SelectItem> 

              <SelectItem value="Singapore">Singapore</SelectItem> 

              <SelectItem value="Global">Global</SelectItem> 

            </SelectContent> 

          </Select> 

        </FormItem> 

      )} 

    /> 

  ); 

} 

 