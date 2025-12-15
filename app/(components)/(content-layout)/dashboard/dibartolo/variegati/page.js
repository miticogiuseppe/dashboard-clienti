import MacchinePage from "@/components/Macchinepage";
import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";

export default function PaginaVariegati() {
  return (
    <>
      <Seo title="Variegati" />
      <Pageheader
        title="Macchine"
        currentpage="Variegati"
        activepage="Variegati"
        showActions={false}
      />
      <MacchinePage fileExcel="/api/download-resource?id=251211" />
    </>
  );
}
