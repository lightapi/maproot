package net.lightapi.portal.covid.query;
import com.networknt.utility.StringUtils;
import org.junit.Assert;
import org.junit.Test;

public class CovidQueryStreamsTest {
    @Test
    public void testCategoryKey() {
        String keyCategory = "CA|ON|Toronto|Service";
        String keySubCategory = "CA|ON|Toronto|Service|Restaurant";
        String category = keyCategory.substring(keyCategory.lastIndexOf("|") + 1);
        System.out.println("category = " + category);
        Assert.assertTrue("Service".equals(category));

        String before = StringUtils.substringBeforeLast(keySubCategory, "|");
        String subCategory = StringUtils.substringAfterLast(keySubCategory, "|");
        String cat = StringUtils.substringAfterLast(before, "|") + "|" + subCategory;
        System.out.println("subCategory = " + cat);
        Assert.assertTrue(cat.equals("Service|Restaurant"));
    }

}