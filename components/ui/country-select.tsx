"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ReactCountryFlag from "react-country-flag";

interface Country {
  value: string;
  label: string;
  code: string;
}

const countries: Country[] = [
  { value: "US", label: "United States", code: "US" },
  { value: "GB", label: "United Kingdom", code: "GB" },
  { value: "CA", label: "Canada", code: "CA" },
  { value: "AU", label: "Australia", code: "AU" },
  { value: "DE", label: "Germany", code: "DE" },
  { value: "FR", label: "France", code: "FR" },
  { value: "JP", label: "Japan", code: "JP" },
  { value: "SG", label: "Singapore", code: "SG" },
  { value: "HK", label: "Hong Kong", code: "HK" },
  { value: "AE", label: "United Arab Emirates", code: "AE" },
  { value: "AD", label: "Andorra", code: "AD" },
  { value: "AO", label: "Angola", code: "AO" },
  { value: "AI", label: "Anguilla", code: "AI" },
  { value: "AQ", label: "Antarctica", code: "AQ" },
  { value: "AG", label: "Antigua and Barbuda", code: "AG" },
  { value: "AR", label: "Argentina", code: "AR" },
  { value: "AM", label: "Armenia", code: "AM" },
  { value: "AW", label: "Aruba", code: "AW" },
  { value: "AT", label: "Austria", code: "AT" },
  { value: "AZ", label: "Azerbaijan", code: "AZ" },
  { value: "BS", label: "Bahamas", code: "BS" },
  { value: "BH", label: "Bahrain", code: "BH" },
  { value: "BD", label: "Bangladesh", code: "BD" },
  { value: "BB", label: "Barbados", code: "BB" },
  { value: "BY", label: "Belarus", code: "BY" },
  { value: "BE", label: "Belgium", code: "BE" },
  { value: "BZ", label: "Belize", code: "BZ" },
  { value: "BJ", label: "Benin", code: "BJ" },
  { value: "BM", label: "Bermuda", code: "BM" },
  { value: "BT", label: "Bhutan", code: "BT" },
  { value: "BO", label: "Bolivia", code: "BO" },
  { value: "BA", label: "Bosnia and Herzegovina", code: "BA" },
  { value: "BW", label: "Botswana", code: "BW" },
  { value: "BR", label: "Brazil", code: "BR" },
  { value: "BN", label: "Brunei", code: "BN" },
  { value: "BG", label: "Bulgaria", code: "BG" },
  { value: "BF", label: "Burkina Faso", code: "BF" },
  { value: "BI", label: "Burundi", code: "BI" },
  { value: "CV", label: "Cabo Verde", code: "CV" },
  { value: "KH", label: "Cambodia", code: "KH" },
  { value: "CM", label: "Cameroon", code: "CM" },
  { value: "CF", label: "Central African Republic", code: "CF" },
  { value: "TD", label: "Chad", code: "TD" },
  { value: "CL", label: "Chile", code: "CL" },
  { value: "CN", label: "China", code: "CN" },
  { value: "CO", label: "Colombia", code: "CO" },
  { value: "KM", label: "Comoros", code: "KM" },
  { value: "CG", label: "Congo", code: "CG" },
  { value: "CD", label: "Democratic Republic of the Congo", code: "CD" },
  { value: "CR", label: "Costa Rica", code: "CR" },
  { value: "CI", label: "Côte d'Ivoire", code: "CI" },
  { value: "HR", label: "Croatia", code: "HR" },
  { value: "CU", label: "Cuba", code: "CU" },
  { value: "CY", label: "Cyprus", code: "CY" },
  { value: "CZ", label: "Czech Republic", code: "CZ" },
  { value: "DK", label: "Denmark", code: "DK" },
  { value: "DJ", label: "Djibouti", code: "DJ" },
  { value: "DM", label: "Dominica", code: "DM" },
  { value: "DO", label: "Dominican Republic", code: "DO" },
  { value: "EC", label: "Ecuador", code: "EC" },
  { value: "EG", label: "Egypt", code: "EG" },
  { value: "SV", label: "El Salvador", code: "SV" },
  { value: "GQ", label: "Equatorial Guinea", code: "GQ" },
  { value: "ER", label: "Eritrea", code: "ER" },
  { value: "EE", label: "Estonia", code: "EE" },
  { value: "SZ", label: "Eswatini", code: "SZ" },
  { value: "ET", label: "Ethiopia", code: "ET" },
  { value: "FJ", label: "Fiji", code: "FJ" },
  { value: "FI", label: "Finland", code: "FI" },
  { value: "GA", label: "Gabon", code: "GA" },
  { value: "GM", label: "Gambia", code: "GM" },
  { value: "GE", label: "Georgia", code: "GE" },
  { value: "GH", label: "Ghana", code: "GH" },
  { value: "GR", label: "Greece", code: "GR" },
  { value: "GD", label: "Grenada", code: "GD" },
  { value: "GT", label: "Guatemala", code: "GT" },
  { value: "GN", label: "Guinea", code: "GN" },
  { value: "GW", label: "Guinea-Bissau", code: "GW" },
  { value: "GY", label: "Guyana", code: "GY" },
  { value: "HT", label: "Haiti", code: "HT" },
  { value: "HN", label: "Honduras", code: "HN" },
  { value: "HU", label: "Hungary", code: "HU" },
  { value: "IS", label: "Iceland", code: "IS" },
  { value: "IN", label: "India", code: "IN" },
  { value: "ID", label: "Indonesia", code: "ID" },
  { value: "IR", label: "Iran", code: "IR" },
  { value: "IQ", label: "Iraq", code: "IQ" },
  { value: "IE", label: "Ireland", code: "IE" },
  { value: "IL", label: "Israel", code: "IL" },
  { value: "IT", label: "Italy", code: "IT" },
  { value: "JM", label: "Jamaica", code: "JM" },
  { value: "JO", label: "Jordan", code: "JO" },
  { value: "KZ", label: "Kazakhstan", code: "KZ" },
  { value: "KE", label: "Kenya", code: "KE" },
  { value: "KI", label: "Kiribati", code: "KI" },
  { value: "KP", label: "North Korea", code: "KP" },
  { value: "KR", label: "South Korea", code: "KR" },
  { value: "KW", label: "Kuwait", code: "KW" },
  { value: "KG", label: "Kyrgyzstan", code: "KG" },
  { value: "LA", label: "Laos", code: "LA" },
  { value: "LV", label: "Latvia", code: "LV" },
  { value: "LB", label: "Lebanon", code: "LB" },
  { value: "LS", label: "Lesotho", code: "LS" },
  { value: "LR", label: "Liberia", code: "LR" },
  { value: "LY", label: "Libya", code: "LY" },
  { value: "LI", label: "Liechtenstein", code: "LI" },
  { value: "LT", label: "Lithuania", code: "LT" },
  { value: "LU", label: "Luxembourg", code: "LU" },
  { value: "MO", label: "Macao", code: "MO" },
  { value: "MG", label: "Madagascar", code: "MG" },
  { value: "MW", label: "Malawi", code: "MW" },
  { value: "MY", label: "Malaysia", code: "MY" },
  { value: "MV", label: "Maldives", code: "MV" },
  { value: "ML", label: "Mali", code: "ML" },
  { value: "MT", label: "Malta", code: "MT" },
  { value: "MH", label: "Marshall Islands", code: "MH" },
  { value: "MR", label: "Mauritania", code: "MR" },
  { value: "MU", label: "Mauritius", code: "MU" },
  { value: "MX", label: "Mexico", code: "MX" },
  { value: "FM", label: "Micronesia", code: "FM" },
  { value: "MD", label: "Moldova", code: "MD" },
  { value: "MC", label: "Monaco", code: "MC" },
  { value: "MN", label: "Mongolia", code: "MN" },
  { value: "ME", label: "Montenegro", code: "ME" },
  { value: "MA", label: "Morocco", code: "MA" },
  { value: "MZ", label: "Mozambique", code: "MZ" },
  { value: "MM", label: "Myanmar", code: "MM" },
  { value: "NA", label: "Namibia", code: "NA" },
  { value: "NR", label: "Nauru", code: "NR" },
  { value: "NP", label: "Nepal", code: "NP" },
  { value: "NL", label: "Netherlands", code: "NL" },
  { value: "NZ", label: "New Zealand", code: "NZ" },
  { value: "NI", label: "Nicaragua", code: "NI" },
  { value: "NE", label: "Niger", code: "NE" },
  { value: "NG", label: "Nigeria", code: "NG" },
  { value: "MK", label: "North Macedonia", code: "MK" },
  { value: "NO", label: "Norway", code: "NO" },
  { value: "OM", label: "Oman", code: "OM" },
  { value: "PK", label: "Pakistan", code: "PK" },
  { value: "PW", label: "Palau", code: "PW" },
  { value: "PS", label: "Palestine", code: "PS" },
  { value: "PA", label: "Panama", code: "PA" },
  { value: "PG", label: "Papua New Guinea", code: "PG" },
  { value: "PY", label: "Paraguay", code: "PY" },
  { value: "PE", label: "Peru", code: "PE" },
  { value: "PH", label: "Philippines", code: "PH" },
  { value: "PL", label: "Poland", code: "PL" },
  { value: "PT", label: "Portugal", code: "PT" },
  { value: "QA", label: "Qatar", code: "QA" },
  { value: "RO", label: "Romania", code: "RO" },
  { value: "RU", label: "Russia", code: "RU" },
  { value: "RW", label: "Rwanda", code: "RW" },
  { value: "KN", label: "Saint Kitts and Nevis", code: "KN" },
  { value: "LC", label: "Saint Lucia", code: "LC" },
  { value: "VC", label: "Saint Vincent and the Grenadines", code: "VC" },
  { value: "WS", label: "Samoa", code: "WS" },
  { value: "SM", label: "San Marino", code: "SM" },
  { value: "ST", label: "Sao Tome and Principe", code: "ST" },
  { value: "SA", label: "Saudi Arabia", code: "SA" },
  { value: "SN", label: "Senegal", code: "SN" },
  { value: "RS", label: "Serbia", code: "RS" },
  { value: "SC", label: "Seychelles", code: "SC" },
  { value: "SL", label: "Sierra Leone", code: "SL" },
  { value: "SK", label: "Slovakia", code: "SK" },
  { value: "SI", label: "Slovenia", code: "SI" },
  { value: "SB", label: "Solomon Islands", code: "SB" },
  { value: "SO", label: "Somalia", code: "SO" },
  { value: "ZA", label: "South Africa", code: "ZA" },
  { value: "SS", label: "South Sudan", code: "SS" },
  { value: "ES", label: "Spain", code: "ES" },
  { value: "LK", label: "Sri Lanka", code: "LK" },
  { value: "SD", label: "Sudan", code: "SD" },
  { value: "SR", label: "Suriname", code: "SR" },
  { value: "SE", label: "Sweden", code: "SE" },
  { value: "CH", label: "Switzerland", code: "CH" },
  { value: "SY", label: "Syria", code: "SY" },
  { value: "TW", label: "Taiwan", code: "TW" },
  { value: "TJ", label: "Tajikistan", code: "TJ" },
  { value: "TZ", label: "Tanzania", code: "TZ" },
  { value: "TH", label: "Thailand", code: "TH" },
  { value: "TL", label: "Timor-Leste", code: "TL" },
  { value: "TG", label: "Togo", code: "TG" },
  { value: "TO", label: "Tonga", code: "TO" },
  { value: "TT", label: "Trinidad and Tobago", code: "TT" },
  { value: "TN", label: "Tunisia", code: "TN" },
  { value: "TR", label: "Turkey", code: "TR" },
  { value: "TM", label: "Turkmenistan", code: "TM" },
  { value: "TV", label: "Tuvalu", code: "TV" },
  { value: "UG", label: "Uganda", code: "UG" },
  { value: "UA", label: "Ukraine", code: "UA" },
  { value: "UY", label: "Uruguay", code: "UY" },
  { value: "UZ", label: "Uzbekistan", code: "UZ" },
  { value: "VU", label: "Vanuatu", code: "VU" },
  { value: "VA", label: "Vatican City", code: "VA" },
  { value: "VE", label: "Venezuela", code: "VE" },
  { value: "VN", label: "Vietnam", code: "VN" },
  { value: "YE", label: "Yemen", code: "YE" },
  { value: "ZM", label: "Zambia", code: "ZM" },
  { value: "ZW", label: "Zimbabwe", code: "ZW" },
];

interface CountrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CountrySelect({
  value,
  onValueChange,
  placeholder = "Select country...",
  className,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCountry = countries.find((country) => country.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-secondary border-border hover:bg-secondary/80",
            className,
          )}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-3">
              <ReactCountryFlag
                countryCode={selectedCountry.code}
                svg
                style={{
                  width: "20px",
                  height: "15px",
                }}
                className="flex-shrink-0"
              />
              <span className="truncate">{selectedCountry.label}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search countries..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-auto">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.value}`}
                  onSelect={() => {
                    onValueChange?.(country.value);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-accent"
                >
                  <ReactCountryFlag
                    countryCode={country.code}
                    svg
                    style={{
                      width: "20px",
                      height: "15px",
                    }}
                    className="flex-shrink-0"
                  />
                  <span className="flex-1 text-left">{country.label}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 flex-shrink-0",
                      value === country.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
