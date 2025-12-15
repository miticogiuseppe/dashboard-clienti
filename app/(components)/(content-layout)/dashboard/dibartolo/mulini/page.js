import MacchinePage from "@/components/Macchinepage";
import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";

export default function PaginaMulini() {
  return (
    <>
      <Seo title="Mulini" />
      <Pageheader
        title="Macchine"
        currentpage="Mulini"
        activepage="Mulini"
        showActions="Mulini"
      />
      <MacchinePage fileExcel="Dibartolo_Mulini" />;
    </>
  );
}
